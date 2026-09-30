import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { getLastTransactionServer } from '@/app/actions/charge';
import type { RecentTx } from '../types';

export function usePosRealtime(
  merchantId: string,
  onChargeCompleted: (tx: RecentTx) => void
) {
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`pos-merchant-${merchantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_charges',
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'completed') {
            // Get the inserted transaction ID for undo functionality
            getLastTransactionServer(merchantId).then((txId) => {
              const tx: RecentTx = {
                id: txId || undefined,
                original_amount: updated.amount,
                discount_pct: updated.discount_applied_pct ?? 0,
                final_amount: updated.final_amount_paid ?? updated.amount,
                client_name: updated.completed_by_name ?? undefined,
                offer_title: updated.offer_title ?? undefined,
              };
              
              onChargeCompleted(tx);

              // Gamification
              try { new Audio('/success.mp3').play().catch(() => {}); } catch (_) {}
              
              import('canvas-confetti').then((confetti) => {
                confetti.default({
                  particleCount: 150,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#3b82f6', '#8b5cf6', '#d946ef', '#10b981']
                });
              });

              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [merchantId, onChargeCompleted]);
}
