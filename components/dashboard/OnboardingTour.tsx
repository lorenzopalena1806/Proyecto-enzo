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
    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
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
        }
      },
      steps: [
        {
          popover: {
            title: '¡Bienvenido a tu Panel de Lazoo! 🚀',
            description: 'Vamos a hacer un recorrido rapidísimo de 1 minuto para que sepas dónde está lo más importante para hacer crecer tu comercio.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#tour-pos',
          popover: {
            title: 'Tu Caja Registradora 💳',
            description: 'Desde acá tus empleados van a escanear los celulares de los clientes y registrar las ventas para aplicar los beneficios.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-offers',
          popover: {
            title: 'Atraé más clientes 🎁',
            description: 'El gancho principal. Acá podés crear promos de 2x1 o descuentos que van a aparecer en el mapa de todos los usuarios de la ciudad.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-branches',
          popover: {
            title: 'Multiplicate en el mapa 🏢',
            description: 'Función PRO exclusiva: Si tenés franquicias o varios locales, agregalos acá para que tu marca aparezca clonada por toda la ciudad.',
            side: 'right',
            align: 'start'
          }
        },
        {
          popover: {
            title: '¡Eso es todo! 🎉',
            description: 'Ya estás listo para empezar a captar más clientes y aumentar tus ventas. ¡Explorá tu panel!',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    });

    tourDriver.drive();
  };

  return null;
}
