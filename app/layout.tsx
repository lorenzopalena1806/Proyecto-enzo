import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { InstallPwaPrompt } from '@/components/shared/InstallPwaPrompt';
import { NetworkStatus } from '@/components/NetworkStatus';

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zoom on mobile inputs
};

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lazoo.vercel.app'),
  title: {
    default: 'Lazoo — Red de Descuentos para Comercios',
    template: '%s | Lazoo',
  },
  description:
    'La plataforma SaaS que conecta comercios locales con una red de descuentos inteligente. QR dinámico, escáner de descuentos y marketing personalizado.',
  keywords: ['descuentos', 'comercios', 'B2B', 'QR', 'SaaS', 'beneficios', 'fidelización'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lazoo',
  },
  openGraph: {
    title: 'Lazoo — Red de Descuentos B2B y B2C',
    description: 'Transformá tu comercio con el ecosistema de beneficios de Lazoo. Cobros por QR, estadísticas en tiempo real y red B2B.',
    url: 'https://lazoo.vercel.app',
    siteName: 'Lazoo',
    images: [
      {
        url: '/og-image.jpg', // Replace with a nice og:image banner later
        width: 800,
        height: 800,
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lazoo — Red de Descuentos para Comercios',
    description: 'Conectá tu negocio a la red inteligente de descuentos.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} h-full`}>
      <body className="min-h-full antialiased font-sans bg-slate-950 text-slate-100">
        <NetworkStatus />
        {children}
        <InstallPwaPrompt />
      </body>
    </html>
  );
}
