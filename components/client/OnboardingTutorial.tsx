'use client';

import React, { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { updateProfileServer } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function OnboardingTutorial({ userId, hasSeen }: { userId: string, hasSeen: boolean }) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (hasSeen) return;

    const timer = setTimeout(() => {
      startTour();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMounted, hasSeen]);

  const startTour = () => {
    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(2, 6, 23, 0.85)',
      nextBtnText: 'Siguiente ➔',
      prevBtnText: '⬅ Atrás',
      doneBtnText: '¡Listo!',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driver-theme-lazoo',
      onDestroyStarted: async () => {
        if (!tourDriver.hasNextStep() || confirm("¿Seguro que querés salir del tutorial?")) {
          tourDriver.destroy();
          await updateProfileServer(userId, { has_seen_tutorial: true });
          router.refresh();
        }
      },
      steps: [
        {
          popover: {
            title: '¡Bienvenido a Lazoo! 🚀',
            description: 'Explorá locales, accedé a descuentos exclusivos y empezá a ahorrar desde tu primera compra.',
            align: 'center',
            side: 'bottom'
          }
        },
        {
          element: '#tour-client-search',
          popover: {
            title: 'Buscador y Categorías 🔍',
            description: 'Encontrá rápidamente lo que buscás filtrando por rubro (Gastronomía, Indumentaria, etc.) o escribiendo el nombre de tu local favorito.',
            align: 'center',
            side: 'bottom'
          }
        },
        {
          element: '#tour-client-scan',
          popover: {
            title: 'El Botón Mágico ✨',
            description: 'Cuando vayas a pagar, tocá este botón y escaneá el QR del comercio en el mostrador para que te apliquen el descuento al instante. ¡Así de fácil!',
            align: 'center',
            side: 'top'
          }
        },
        {
          element: '#tour-client-history',
          popover: {
            title: 'Mis Ahorros 💰',
            description: 'Llevá un registro automático de todos los beneficios que ya usaste y enterate exactamente cuánta plata vas ahorrando.',
            align: 'start',
            side: 'top'
          }
        },
        {
          element: '#tour-client-share',
          popover: {
            title: '¡Compartí y sumá! 📢',
            description: '¡No te guardes el secreto! Pasale tu enlace a tus amigos o familiares para que ellos también se sumen a ahorrar.',
            align: 'end',
            side: 'bottom'
          }
        }
      ]
    });

    tourDriver.drive();
  };

  return null;
}
