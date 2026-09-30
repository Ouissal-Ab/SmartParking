'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Car, LogOut, User as UserIcon, ChevronDown, Calendar, Map, Settings } from 'lucide-react';
import { clearSession, getStoredUser } from '@/lib/auth';
import type { User } from '@/types/user';
import { cn } from '@/lib/utils';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    router.push('/');
  };

  const links = [
    { href: '/dashboard', label: 'Carte', icon: Map },
    { href: '/reservations', label: 'Mes réservations', icon: Calendar },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-all duration-300',
        scrolled
          ? 'border-b border-white/40 bg-white/55 backdrop-blur-2xl shadow-soft'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-text-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAB95B] text-[#1A1F2E] shadow-md">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-lg tracking-tight">Smart Parking</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  active
                    ? 'bg-[#FAB95B]/20 text-[#1A1F2E] ring-1 ring-[#FAB95B]/40'
                    : 'text-text-secondary hover:bg-white/50 hover:text-text-primary',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="glass-pill flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-all hover:bg-white/65"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FAB95B] text-[#1A1F2E]">
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:inline">{user ? user.firstName : 'Compte'}</span>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="glass-card absolute right-0 top-12 z-20 w-60 p-2">
                {user && (
                  <div className="border-b border-white/30 px-3 py-2.5">
                    <p className="text-sm font-semibold text-text-primary">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-text-muted">{user.email}</p>
                  </div>
                )}
                <div className="space-y-0.5 pt-2 md:hidden">
                  {links.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-primary transition-colors hover:bg-white/50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-primary transition-colors hover:bg-white/50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#8B3A3A] transition-colors hover:bg-[#B85450]/12"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
