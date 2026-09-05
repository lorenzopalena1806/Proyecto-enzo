'use client';

import React, { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function OffersTour() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const hasSeenTour = localStorage.getItem('lazoo_offers_tour_completed');
    
    // Si ya lo vio, no hacemos nada
    if (hasSeenTour) return;

    // Pequeño delay para asegurar que el DOM del formulario cargó
    const timer = setTimeout(() => {
      startTour();
    }, 500);

    return () => clearTimeout(timer);
  }, [isMounted]);

  const startTour = () => {
    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(2, 6, 23, 0.85)',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Atrás',
      doneBtnText: 'Listo!',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driver-theme-lazoo',
      onHighlightStarted: (element) => {
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      },
      onDestroyStarted: () => {
        if (!tourDriver.hasNextStep() || confirm('Seguro que querés salir del tutorial de ofertas?')) {
          localStorage.setItem('lazoo_offers_tour_completed', 'true');
          tourDriver.destroy();
        }
      },
      steps: [
        {
          popover: {
            title: '¡Creá tu primera oferta! 🎆',
            description: 'Vamos a ver cómo publicar un producto o promoción que va a aparecer en el celular de todos tus clientes.',
            align: 'center',
            side: 'bottom'
          }
        },
        {
          element: '#tour-offer-title',
          popover: {
            title: 'Título Llamativo 💦',
            description: 'Escribí algo claro y directo. Ej: "2x1 en Pintas" o "Hamburguesa con fritas". Que tiente al cliente a ir!',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-offer-prices',
          popover: {
            title: 'Precios y Descuentos 📰',
            description: 'Podés ingresar el Precio Original y el Precio Final, y el sistema calculará el % de descuento por vos. O podés poner directamente el porcentaje!',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-offer-days',
          popover: {
            title: 'Días Estratégicos 𓆅',
            description: 'Tenés los martes vacíos? Elegí que esta oferta solo esté disponible los martes para traccionar gente esos días.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#tour-offer-stock',
          popover: {
            title: 'Ofertas Limitadas ⌶',
            description: 'Si querés generar urgencia, ponele un límite de stock (ej: 50 cupones). Cuando se agoten, la oferta se pausará automáticamente.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-offer-submit',
          popover: {
            title: 'A vender! 🚀',
            description: 'Tocá en Publicar Oferta y en segundos estará visible para todos. ¡Aprovechá la vista previa de la derecha para ver cómo queda!',
            side: 'top',
            align: 'center'
          }
        }
      ]
    });

    tourDriver.drive();
  };

  return null;
}
