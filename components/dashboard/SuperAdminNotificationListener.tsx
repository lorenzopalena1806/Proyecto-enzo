'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertOctagon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SuperAdminNotificationListener({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!isSuperAdmin) return;

    const supabase = createClient();

    const channel = supabase
      .channel('admin-reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          // Toast notification with action
          toast('¡Nueva denuncia recibida!', {
            description: `Motivo: ${payload.new.reason === 'refused_discount' ? 'Se negó a dar descuento' : payload.new.reason === 'fake_offer' ? 'Oferta falsa' : payload.new.reason === 'bad_treatment' ? 'Mala atención' : 'Otro motivo'}`,
            icon: <AlertOctagon className="w-5 h-5 text-red-500" />,
            duration: 10000,
            action: {
              label: 'Revisar',
              onClick: () => {
                // Navegar a la página de denuncias (a implementar en el futuro)
                toast.info('Pronto implementaremos la página de gestión de denuncias.');
              }
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, router]);

  return null;
}
