import Link from 'next/link';
import { Car } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/30 bg-white/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAB95B] text-[#1A1F2E] shadow-md">
            <Car className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Smart Parking</span>
        </div>
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} Smart Parking. Tous droits réservés.
        </p>
        <nav className="flex gap-5 text-xs text-text-secondary">
          <Link href="/" className="transition-colors hover:text-text-primary">
            Accueil
          </Link>
          <Link href="/login" className="transition-colors hover:text-text-primary">
            Connexion
          </Link>
          <Link href="/register" className="transition-colors hover:text-text-primary">
            S&apos;inscrire
          </Link>
        </nav>
      </div>
    </footer>
  );
}
