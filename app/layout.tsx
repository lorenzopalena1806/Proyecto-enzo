import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'RedBeneficios — Red de Descuentos B2B para Comercios',
    template: '%s | RedBeneficios',
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
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased font-sans bg-slate-950">
        {children}
      </body>
    </html>
  );
}
