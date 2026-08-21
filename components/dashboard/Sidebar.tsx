'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  QrCode,
  ScanLine,
  ImageIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
  Users,
  Settings,
  Tag,
  History,
} from 'lucide-react';
import type { Profile } from '@/types';

interface SidebarProps {
  profile: Profile;
}

const MERCHANT_NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/pos',
    label: 'Cobrar con QR (POS)',
    icon: ScanLine,
    exact: false,
  },
  {
    href: '/dashboard/qr',
    label: 'Comprar / B2B',
    icon: QrCode,
    exact: false,
  },
  {
    href: '/dashboard/offers',
    label: 'Mis Ofertas',
    icon: Tag,
    exact: false,
  },
  {
    href: '/dashboard/marketing',
    label: 'Marketing',
    icon: ImageIcon,
    exact: false,
  },
  {
    href: '/dashboard/history',
    label: 'Historial',
    icon: History,
    exact: false,
  },
  {
    href: '/dashboard/profile',
    label: 'Mi Perfil',
    icon: Settings,
    exact: false,
  },
];

const ADMIN_NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/merchants',
    label: 'Habilitar Comercios',
    icon: Store,
    exact: false,
  },
  {
    href: '/admin/users',
    label: 'Usuarios Registrados',
    icon: Users,
    exact: false,
  },
  {
    href: '/admin/marketing',
    label: 'Upload Marketing',
    icon: ImageIcon,
    exact: false,
  },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200 flex justify-center bg-slate-50/50">
        <Link href="/dashboard">
          <img src="/logo.png" alt="Lazoo" className="h-12 w-auto rounded-lg object-contain drop-shadow-sm" />
        </Link>
      </div>

      {/* Perfil */}
      <div className="px-4 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 border border-blue-200 flex-shrink-0">
            <span className="text-blue-700 text-sm font-bold">
              {(profile.business_name ?? profile.full_name ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 text-sm font-bold truncate">
              {profile.business_name ?? profile.full_name ?? 'Sin nombre'}
            </p>
            <p className="text-slate-500 text-xs capitalize font-medium">{profile.role === 'merchant' ? 'Comerciante' : profile.role}</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto bg-white">
        {(profile.role === 'superadmin' ? ADMIN_NAV_ITEMS : MERCHANT_NAV_ITEMS).map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${active
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>{item.label}</span>
              {active && <ChevronRight className="h-3 w-3 ml-auto text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-200 pt-4 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border border-transparent transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <Link href="/dashboard" className="flex items-center">
          <img src="/logo.png" alt="Lazoo" className="h-10 w-auto rounded-md object-contain" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 w-72 bg-white border-r border-slate-200 h-full overflow-y-auto shadow-2xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
}
