'use client';

import React, { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function OnboardingTour() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const hasSeenTour = localStorage.getItem('lazoo_tour_completed');
    
    // Si ya lo vio, no hacemos nada (a menos que estemos forzando el testeo)
    if (hasSeenTour) return;

    // Pequeño delay para asegurar que el DOM cargó
    const timer = setTimeout(() => {
      startTour();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMounted]);

  const startTour = () => {
    // Abrir sidebar en móviles al arrancar el tour
    window.dispatchEvent(new Event('lazoo-open-sidebar'));

    setTimeout(() => {
      const isMobile = window.innerWidth < 1024;
      const getSelector = (s: string) => isMobile && s.startsWith('#tour-') ? `${s}-mobile` : s;

      const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(2, 6, 23, 0.85)', // bg-slate-950 con opacidad
      nextBtnText: 'Siguiente ➔',
      prevBtnText: '⬅ Atrás',
      doneBtnText: '¡Listo!',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driver-theme-lazoo',
      onDestroyStarted: () => {
        if (!tourDriver.hasNextStep() || confirm("¿Seguro que querés salir del tutorial?")) {
          localStorage.setItem('lazoo_tour_completed', 'true');
          tourDriver.destroy();
          window.dispatchEvent(new Event('lazoo-close-sidebar'));
        }
      },
      steps: [
        {
          popover: {
            title: '¡Bienvenido a tu Panel de Lazoo! 🚀',
            description: 'Este es tu centro de control. Desde acá vas a gobernar todas las promociones y descuentos de tu local.',
            align: 'center',
            side: 'bottom'
          }
        },
        {
          element: getSelector('#tour-profile'),
          popover: {
            title: 'Tu Perfil y Marca 📝',
            description: 'Configurá el nombre, rubro y logo de tu negocio. Si tenés el Plan PRO, ¡también podés vincular tu Instagram para sumar seguidores!',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-branches'),
          popover: {
            title: 'Tus Locales / Sucursales 🏢',
            description: 'Acá cargás la dirección, horarios, mapa y WhatsApp de tu local para que los clientes te visiten. Si sos PRO, podés agregar múltiples sucursales.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-employee'),
          popover: {
            title: 'Creando a tu Equipo 👥',
            description: 'No hace falta que vos estés en la caja todo el día. Creale un acceso a tus empleados con un PIN de 4 dígitos para que cobren de forma segura por vos.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-employee'),
          popover: {
            title: 'Modo Privacidad de Cajero 🔒',
            description: 'Tus empleados nunca van a ver este panel ni tu facturación. Ellos tienen un enlace especial (/cajero) donde solo operan de forma limitada.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-pos'),
          popover: {
            title: '¿Cómo funciona el cobro? 📱',
            description: '¡Es súper fácil! Cuando un cliente quiere pagar, ingresás el monto de la compra en este panel y hacés clic en "Generar QR de Cobro".',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-pos'),
          popover: {
            title: 'El proceso de escaneo 🎯',
            description: 'El sistema habilitará automáticamente tu QR impreso con ese monto exacto. El cliente simplemente lo escanea con su celular y la venta se registra sola.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-history'),
          popover: {
            title: 'Cálculo Inteligente 🧠',
            description: 'Lazoo se encarga de calcular el descuento automáticamente y te registra la venta al instante en este panel.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-history'),
          popover: {
            title: 'El Cerebro de tu Local 📈',
            description: 'Acá vas a ver los gráficos de tu rendimiento. Es fundamental para descubrir qué días vendés más y quiénes son tus mejores clientes (Exclusivo PRO).',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-history'),
          popover: {
            title: 'Historial Transparente 🔍',
            description: 'También podés revisar ticket por ticket a qué hora se hizo cada cobro y con qué medio de pago (efectivo o transferencia).',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-pro'),
          popover: {
            title: 'Control Total de tu Plan 👑',
            description: 'Desde acá manejás tu pago mensual, podés pausar tu cuenta, o pasarte al Plan PRO cuando quieras potenciar tus ventas y desbloquear más funciones.',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: getSelector('#tour-inicio'),
          popover: {
            title: 'Nunca estás solo 💬',
            description: '¿Tenés alguna duda o querés sugerir algo? Usá siempre el botón flotante de Soporte para hablar directo con el equipo de Lazoo. ¡Éxitos!',
            side: 'right',
            align: 'center'
          }
        }
      ]
    });

    tourDriver.drive();
    }, 300); // 300ms delay to allow sidebar to render
  };

  return null;
}
