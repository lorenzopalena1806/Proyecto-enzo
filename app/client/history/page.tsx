import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ClientHistoryList } from '@/components/client/ClientHistoryList';
import { ClientBottomNav } from '@/components/client/ClientBottomNav';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { ShareButton } from '@/components/shared/ShareButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi Historial | Lazoo' };

export default async function ClientHistoryPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'merchant') {
    redirect('/dashboard/history');
  }

  const { data: clientHistory } = await adminClient
    .from('discount_transactions')
    .select(`
      *,
      scanner:profiles!scanner_id(business_name, full_name),
      offer:merchant_offers!offer_id(title)
    `)
    .eq('scanned_user_id', user.id)
    .order('applied_at', { ascending: false });

  const displayHistory = clientHistory || [];

  return (
    <div className="min-h-screen app-bg flex flex-col font-sans text-white">
      <style dangerouslySetInnerHTML={{__html: `
        .app-bg {
          background: radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%);
        }
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}} />
      
      {/* Background ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Lazoo" className="h-7 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <ShareButton className="text-xs text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-semibold" />
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-8 pb-32 relative z-10">
        <ClientHistoryList history={displayHistory} />
      </main>

      <ClientBottomNav />
    </div>
  );
}
