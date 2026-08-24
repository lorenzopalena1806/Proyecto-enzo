import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { PrintQRCard } from '@/components/dashboard/PrintQRCard';

export const metadata = {
  title: 'Imprimir QR del Local | Lazoo',
  description: 'Cartel oficial para imprimir y colocar en el mostrador del local.',
};

export default async function PrintQRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, business_name, full_name, role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'merchant') redirect('/dashboard');

  const businessName = profile.business_name || profile.full_name || 'Comercio Lazoo';
  const qrUrl = `https://lazoo.vercel.app/pay?m=${user.id}`;

  return (
    <PrintQRCard
      merchantId={user.id}
      businessName={businessName}
      qrUrl={qrUrl}
    />
  );
}
