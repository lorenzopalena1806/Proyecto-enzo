import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { InstallPwaPrompt } from '@/components/shared/InstallPwaPrompt';

export const viewport: Viewport = {
  themeColor: '#020617',
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
  title: {
    default: 'Lazoo — Lazoo - Red de Descuentos B2B para Comercios',
    template: '%s | Lazoo',
  },
  description:
    'La plataforma SaaS que conecta comercios locales con una red de descuentos inteligente. QR dinámico, escáner de descuentos y marketing personalizado.',
  keywords: ['descuentos', 'comercios', 'B2B', 'QR', 'SaaS', 'beneficios'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} h-full`}>
      <body className="min-h-full antialiased font-sans bg-slate-950 text-slate-100">
        {children}
        <InstallPwaPrompt />
      </body>
    </html>
  );
}
