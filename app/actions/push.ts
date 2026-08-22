'use server';

import webpush from 'web-push';
import { createClient, createAdminClient } from '@/lib/supabase-server';

// Configure Web Push
webpush.setVapidDetails(
  'mailto:soporte@lazoo.com.ar',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function subscribeToPushServer(subscription: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();

  // Extract subscription details
  const { endpoint, keys } = subscription;
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return { success: false, error: 'Invalid subscription data' };
  }

  // Insert or handle conflict. We use ON CONFLICT ON CONSTRAINT if there's a unique constraint, 
  // or we can just upsert by doing a select first.
  // We added a UNIQUE(user_id, endpoint) in the migration.
  
  const { error } = await adminClient
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        auth,
        p256dh
      },
      { onConflict: 'user_id, endpoint' }
    );

  if (error) {
    console.error('Error saving subscription:', error);
    return { success: false, error: 'Database error' };
  }

  return { success: true };
}

export async function unsubscribeFromPushServer(endpoint: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) {
    return { success: false, error: 'Database error' };
  }

  return { success: true };
}

/**
 * Utility to send a push notification to a specific user.
 * This is meant to be called from other server actions (e.g., when a payment is processed).
 */
export async function sendPushNotification(userId: string, payload: { title: string, body: string, url?: string }) {
  const adminClient = createAdminClient();
  
  const { data: subscriptions, error } = await adminClient
    .from('push_subscriptions')
    .select('endpoint, auth, p256dh')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { success: false, error: 'No subscriptions found' };
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
  });

  const promises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        },
        pushPayload
      );
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Subscription has expired or is no longer valid, delete it
        await adminClient
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint);
      } else {
        console.error('Error sending push notification:', err);
      }
    }
  });

  await Promise.all(promises);
  return { success: true };
}
