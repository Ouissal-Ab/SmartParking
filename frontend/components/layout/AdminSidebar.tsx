'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Users,
  LogOut,
  Car,
  Menu,
  X,
} from 'lucide-react';
import { clearSession } from '@/lib/auth';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin',              label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/parkings',     label: 'Parkings',         icon: MapPin },
  { href: '/admin/reservations', label: 'Réservations',     icon: ClipboardList },
  { href: '/admin/users',        label: 'Utilisateurs',     icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const SidebarContent = () => (
    <>
      <Link
        href="/admin"
        className="flex items-center gap-3 px-5 py-6 text-white"
        onClick={() => setMobileOpen(false)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAB95B] text-[#1A1F2E] shadow-md">
          <Car className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight">Smart Parking</p>
          <p className="text-[10px] uppercase tracking-wider text-[#FAB95B]/70">Admin</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3 pt-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[#FAB95B]/15 text-[#FAB95B] shadow-inner'
                  : 'text-white/75 hover:bg-white/15 hover:text-white',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FAB95B]" />
              )}
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-[#FAB95B]' : 'text-white/75 group-hover:text-white',
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-[#B85450]/25 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="glass-pill fixed left-4 top-4 z-40 rounded-lg p-2.5 md:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-text-primary" />
      </button>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900/95 backdrop-blur-2xl md:flex">
        <div
          className="absolute inset-0 -z-10 opacity-25"
          style={{
            background:
              'radial-gradient(circle at 25% 15%, rgba(250,185,91,0.30), transparent 55%), radial-gradient(circle at 75% 85%, rgba(212,149,67,0.18), transparent 55%)',
          }}
          aria-hidden
        />
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900/95 backdrop-blur-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
