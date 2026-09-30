'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Car,
  ArrowRight,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  ParkingCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { MeshBackdrop } from '@/components/layout/MeshBackdrop';
import { Footer } from '@/components/layout/Footer';
import { MobileHandoffQR } from '@/components/MobileHandoffQR';

interface BackendStats {
  totalParkings: number;
  totalPlaces: number;
  placesLibres: number;
  tauxOccupation: number;
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function LandingPage() {
  const [stats, setStats] = useState<BackendStats>({
    totalParkings: 12,
    totalPlaces: 850,
    placesLibres: 320,
    tauxOccupation: 62,
  });
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    api
      .get<BackendStats>('/admin/dashboard/stats')
      .then((r) => setStats(r.data))
      .catch(() => {});

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalParkings = useCountUp(stats.totalParkings);
  const availability = useCountUp(Math.max(0, 100 - Math.round(stats.tauxOccupation)));
  const placesLibres = useCountUp(stats.placesLibres);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MeshBackdrop />

      {/* ============ NAVBAR ============ */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/40 bg-white/50 backdrop-blur-2xl shadow-soft'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-text-primary">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAB95B] text-[#1A1F2E] shadow-md">
              <Car className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-[#1A3263] ring-2 ring-surface" />
            </div>
            <span className="text-lg tracking-tight">Smart Parking</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/55"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#FAB95B] px-5 py-2 text-sm font-semibold text-[#1A1F2E] shadow-md transition-all hover:bg-[#F0AC42] hover:shadow-lg"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative pb-32 pt-12 sm:pt-20 lg:pt-24">
        <div className="grid-pattern absolute inset-0 -z-10" aria-hidden />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-text-primary"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#D49543]" />
                Disponibilité actualisée en temps réel
                <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#FAB95B]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
              >
                Garez-vous en{' '}
                <span className="gradient-text">quelques secondes</span>,<br className="hidden sm:block" />{' '}
                sans tourner&nbsp;en&nbsp;rond.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-6 max-w-xl text-base text-text-secondary sm:text-lg"
              >
                Smart Parking détecte les places libres en direct,
                les réserve à l&apos;avance et règle tout en un seul tap.
                Fini les tours du quartier&nbsp;: votre place vous attend.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#FAB95B] px-7 py-3.5 text-sm font-semibold text-[#1A1F2E] shadow-gold transition-all hover:bg-[#F0AC42] hover:shadow-gold-lg"
                >
                  Commencer maintenant
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/register"
                  className="glass-pill inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-white/65"
                >
                  Créer un compte
                </Link>
              </motion.div>

              {/* Inline stats — fluid row, no overlap */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-text-primary"
              >
                <InlineStat value={totalParkings} suffix="" label="Parkings" />
                <span className="hidden h-8 w-px bg-border sm:block" />
                <InlineStat value={availability} suffix="%" label="Disponibilité" />
                <span className="hidden h-8 w-px bg-border sm:block" />
                <InlineStat value={placesLibres} suffix="+" label="Places libres" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <HeroMockup />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============ TRUST MARQUEE ============ */}
      <section className="relative -mt-12 overflow-hidden border-y border-white/30 bg-white/20 py-6 backdrop-blur-md">
        <div className="marquee flex gap-12 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-12 px-6 text-text-muted">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-[#FAB95B]" /> Temps réel
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Shield className="h-4 w-4 text-[#1A3263]" /> Paiement chiffré
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ParkingCircle className="h-4 w-4 text-[#D49543]" /> 1000+ places
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[#FAB95B]" /> Premium
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-[#1A3263]" /> +98% satisfaction
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES — BENTO ============ */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#D49543]">
            Fonctionnalités
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Pensé pour les <span className="gradient-text">vrais conducteurs</span>
          </h2>
          <p className="mt-4 text-text-secondary">
            Tout ce dont vous avez besoin pour vous garer sans frustration.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-12">
          <BentoCard className="sm:col-span-6 lg:col-span-7" gradient="from-[#FAB95B]/25 to-[#1A3263]/12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Icon icon={MapPin} color="gold" />
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
                  Carte interactive en direct
                </h3>
                <p className="mt-2 max-w-md text-sm text-text-secondary">
                  Voyez instantanément où sont les places libres,
                  filtrez par tarif, distance ou disponibilité.
                </p>
              </div>
              <MiniMap />
            </div>
          </BentoCard>

          <BentoCard className="sm:col-span-3 lg:col-span-5" gradient="from-[#D49543]/25 to-[#FAB95B]/15">
            <Icon icon={Calendar} color="dark" />
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
              Réservez à l&apos;avance
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Bloquez votre place pour les heures à venir et arrivez l&apos;esprit tranquille.
            </p>
            <div className="mt-4 flex gap-2">
              {['Aujourd\'hui', 'Demain', 'Cette semaine'].map((t) => (
                <span key={t} className="glass-pill rounded-full px-3 py-1 text-xs font-medium text-text-secondary">
                  {t}
                </span>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="sm:col-span-3 lg:col-span-4" gradient="from-[#1A3263]/20 to-[#FAB95B]/12">
            <Icon icon={CreditCard} color="dark" />
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
              Paiement en 1 tap
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Carte, mobile ou virement. Reçu PDF instantané.
            </p>
          </BentoCard>

          <BentoCard className="sm:col-span-3 lg:col-span-4" gradient="from-[#B85450]/18 to-[#FAB95B]/12">
            <Icon icon={Shield} color="danger" />
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
              Sécurité bancaire
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Chiffrement de bout en bout, conformité RGPD.
            </p>
          </BentoCard>

          <BentoCard className="sm:col-span-6 lg:col-span-4" gradient="from-[#FAB95B]/22 to-[#1A3263]/10">
            <Icon icon={Sparkles} color="gold" />
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
              IA de détection
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Caméras connectées + ML pour des places à jour à la seconde.
            </p>
          </BentoCard>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="glass-card relative overflow-hidden p-10 sm:p-12 lg:p-14">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#FAB95B]/40 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#1A3263]/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
                Prêt à <span className="gradient-text">arrêter de chercher</span>&nbsp;?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-text-secondary lg:mx-0">
                Rejoignez Smart Parking en moins d&apos;une minute. Gratuit, sans engagement.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FAB95B] px-7 py-3.5 text-sm font-semibold text-[#1A1F2E] shadow-gold transition-all hover:scale-[1.02] hover:bg-[#F0AC42] hover:shadow-gold-lg"
              >
                Démarrer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="hidden md:flex md:justify-center lg:justify-end">
              <MobileHandoffQR
                path="/"
                size={172}
                label="Ou continuez sur mobile"
                hint="Scannez ce QR code pour ouvrir Smart Parking sur votre téléphone."
                layout="column"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function InlineStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
        {value}
        {suffix}
      </p>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

function Icon({
  icon: I,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: 'gold' | 'dark' | 'danger';
}) {
  const styles = {
    gold:   'bg-[#FAB95B] text-[#1A1F2E]',
    dark:   'bg-[#1A3263] text-[#FAB95B]',
    danger: 'bg-[#B85450] text-white',
  } as const;
  return (
    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${styles[color]} shadow-md`}>
      <I className="h-5 w-5" />
    </div>
  );
}

function BentoCard({
  children,
  className = '',
  gradient,
}: {
  children: React.ReactNode;
  className?: string;
  gradient: string;
}) {
  return (
    <div
      className={`glass-card group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-card ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 transition-opacity duration-500 group-hover:opacity-80`}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      {/* Glow ring */}
      <div className="absolute inset-0 -m-4 rounded-[2.5rem] bg-gradient-to-br from-[#FAB95B]/35 via-[#FAB95B]/15 to-[#1A3263]/25 blur-2xl" />

      {/* Phone */}
      <div className="relative h-full overflow-hidden rounded-[2.5rem] border border-white/40 bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-2xl">
        <div className="relative h-full rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 p-4">
          {/* Notch */}
          <div className="mx-auto mb-3 h-1.5 w-24 rounded-full bg-white/20" />

          {/* App header */}
          <div className="mb-3 flex items-center justify-between text-white/90">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Centre-ville</p>
              <p className="text-sm font-bold">Parking IA</p>
            </div>
            <div className="rounded-full bg-[#FAB95B]/20 px-2 py-1 text-[10px] font-semibold text-[#FAB95B]">
              68 libres
            </div>
          </div>

          {/* Grid of spots */}
          <div className="grid h-[200px] grid-cols-5 gap-1.5">
            {Array.from({ length: 25 }).map((_, i) => {
              const isSelected = i === 12;
              const isFree = [0, 2, 5, 6, 8, 11, 14, 17, 18, 20, 23].includes(i);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center rounded-md text-[8px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#FAB95B] text-slate-900 shadow-lg shadow-[#FAB95B]/45 ring-2 ring-white/40'
                      : isFree
                        ? 'bg-[#547792]/25 text-[#E8E2DB]'
                        : 'bg-white/5 text-white/15'
                  }`}
                >
                  P{i + 1}
                </div>
              );
            })}
          </div>

          {/* Summary card */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
            <p className="text-[10px] text-white/50">Place sélectionnée</p>
            <div className="mt-1 flex items-baseline justify-between text-white">
              <p className="text-lg font-bold">P13</p>
              <p className="text-sm font-semibold">
                <span className="text-[#FAB95B]">10 MAD</span>
                <span className="text-white/40"> / h</span>
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center rounded-lg bg-[#FAB95B] py-2.5 text-xs font-semibold text-slate-900 shadow-md shadow-[#FAB95B]/35">
            Réserver maintenant →
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card absolute -left-6 top-12 hidden flex-col gap-1 p-3 sm:flex"
      >
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Disponibilité</p>
        <p className="text-lg font-bold text-text-primary">68 / 200</p>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-border">
          <div className="h-full w-[34%] rounded-full bg-[#FAB95B]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="glass-card absolute -right-6 bottom-12 hidden items-center gap-2 p-3 sm:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAB95B] text-[#1A1F2E]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-text-primary">Place réservée !</p>
          <p className="text-[10px] text-text-muted">Il y a 2 secondes</p>
        </div>
      </motion.div>
    </div>
  );
}

function MiniMap() {
  return (
    <div className="hidden h-32 w-44 shrink-0 overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-slate-800 to-slate-900 p-2 shadow-lg sm:block">
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-900">
        {/* Stylized map grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        {/* Roads */}
        <div className="absolute left-2 right-2 top-1/2 h-1 rounded-full bg-white/15" />
        <div className="absolute bottom-2 top-2 left-1/2 w-1 rounded-full bg-white/15" />
        {/* Pins */}
        {[
          { top: '20%', left: '25%', color: 'bg-[#FAB95B]' },
          { top: '60%', left: '70%', color: 'bg-[#E8E2DB]' },
          { top: '70%', left: '30%', color: 'bg-[#FAB95B]' },
          { top: '30%', left: '75%', color: 'bg-[#B85450]' },
        ].map((p, i) => (
          <span
            key={i}
            style={{ top: p.top, left: p.left }}
            className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${p.color} ring-2 ring-white/30`}
          />
        ))}
      </div>
    </div>
  );
}
