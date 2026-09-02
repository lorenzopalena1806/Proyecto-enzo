import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { InstallPwaPrompt } from '@/components/shared/InstallPwaPrompt';
import { NetworkStatus } from '@/components/NetworkStatus';
import { CookieBanner } from '@/components/marketing/CookieBanner';

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
  metadataBase: new URL('https://lazoo.com.ar'),
  title: {
    default: 'Lazoo — Red de Descuentos en La Calera y Córdoba',
    template: '%s | Lazoo',
  },
  description:
    'Lazoo es la red inteligente de descuentos y beneficios exclusiva para comercios y usuarios en La Calera, Córdoba, Argentina. Incrementá tus ventas con códigos QR y fidelización.',
  keywords: ['Lazoo', 'descuentos La Calera', 'beneficios Córdoba', 'red B2B', 'fidelización Argentina', 'comercios La Calera', 'QR', 'SaaS'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lazoo',
  },
  openGraph: {
    title: 'Lazoo — Red de Descuentos en La Calera y Córdoba',
    description: 'Transformá tu comercio con el ecosistema de beneficios de Lazoo. Cobros por QR, estadísticas en tiempo real y red B2B en Argentina.',
    url: 'https://lazoo.com.ar',
    siteName: 'Lazoo',
    locale: 'es_AR',
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

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import NextTopLoader from 'nextjs-toploader';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { Analytics as CustomAnalytics } from '@/components/shared/Analytics';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} h-full`}>
      <body className="min-h-full antialiased font-sans bg-slate-950 text-slate-100">
        <NextTopLoader
          color="#06b6d4"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #06b6d4,0 0 5px #06b6d4"
        />
        <NetworkStatus />
        {children}
        <ScrollToTop />
        <InstallPwaPrompt />
        <CookieBanner />
        <SpeedInsights />
        <CustomAnalytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
