'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Lock,
  ChevronLeft,
  Smartphone,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { toReservation, type BackendReservation } from '@/lib/adapters';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { getStoredUser } from '@/lib/auth';

type Method = 'CARTE' | 'MOBILE' | 'VIREMENT';

const cardSchema = z.object({
  cardName: z.string().min(2, 'Nom du titulaire requis'),
  cardNumber: z.string().regex(/^[0-9 ]{13,23}$/, 'Numéro de carte invalide'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format MM/AA requis'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV invalide'),
});
type CardFormValues = z.infer<typeof cardSchema>;

function PaymentInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [method, setMethod] = useState<Method>('CARTE');
  const [submitting, setSubmitting] = useState(false);
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [initiatorMismatch, setInitiatorMismatch] = useState<{
    initiator: string;
    current: string;
  } | null>(null);

  const summary = useMemo(
    () => ({
      parkingId: search.get('parkingId') || '',
      parkingName: search.get('parkingName') || 'Parking',
      spot: search.get('spot') || '',
      date: search.get('date') || '',
      startTime: search.get('startTime') || '',
      endTime: search.get('endTime') || '',
      duration: Number(search.get('duration') || 1),
      total: Number(search.get('total') || 0),
      initiator: search.get('initiator') || '',
    }),
    [search],
  );

  // Detect QR initiator mismatch — warns when the phone user is not the one
  // who created the QR on desktop.
  useEffect(() => {
    if (!summary.initiator) return;
    const me = getStoredUser();
    const myEmail = me?.email?.toLowerCase() || '';
    const expected = summary.initiator.toLowerCase();
    if (myEmail && expected && myEmail !== expected) {
      setInitiatorMismatch({ initiator: summary.initiator, current: me?.email || '' });
    }
  }, [summary.initiator]);

  // Build the mobile-reachable URL using the LAN IP exposed by /api/lan-ip.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = new URL(window.location.href);
    // Append initiator email if missing so the phone can verify the user
    if (!current.searchParams.get('initiator')) {
      const me = getStoredUser();
      if (me?.email) current.searchParams.set('initiator', me.email);
    }

    fetch('/api/lan-ip')
      .then((r) => (r.ok ? r.json() : { ip: null }))
      .then(({ ip }) => {
        if (ip && (current.hostname === 'localhost' || current.hostname === '127.0.0.1')) {
          current.hostname = ip;
        }
        setMobileUrl(current.toString());
      })
      .catch(() => setMobileUrl(current.toString()));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormValues>({ resolver: zodResolver(cardSchema) });

  const doPayment = async () => {
    if (initiatorMismatch) {
      toast.error("Ce paiement n'est pas destiné à votre compte.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: created } = await api.post<BackendReservation>('/user/reserve', {
        parkingId: Number(summary.parkingId),
        numeroPlace: summary.spot,
        dateReservation: summary.date,
        heureDebut: `${summary.startTime}:00`,
        heureFin: `${summary.endTime}:00`,
      });

      await api.post('/user/payment', { reservationId: created.id, methode: method });

      toast.success('Paiement effectué avec succès !');
      const r = toReservation({ ...created, methodePaiement: method });
      const params = new URLSearchParams({
        reference: created.code || `SP-${created.id}`,
        parkingName: r.parkingName,
        spot: r.spotNumber,
        date: r.startTime.split('T')[0],
        startTime: summary.startTime,
        duration: String(r.duration),
        total: String(r.totalAmount),
        reservationId: String(created.id),
      });
      router.push(`/confirmation?${params.toString()}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Paiement échoué.';
      toast.error(typeof msg === 'string' ? msg : 'Paiement échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  const onCardSubmit = (_values: CardFormValues) => {
    void _values;
    return doPayment();
  };

  const [applePayState, setApplePayState] = useState<'idle' | 'authing' | 'processing'>('idle');

  const triggerApplePay = () => {
    if (initiatorMismatch || submitting || applePayState !== 'idle') return;
    setApplePayState('authing');
    // Simulated Touch ID / Face ID
    setTimeout(() => {
      setApplePayState('processing');
      // Simulated card tokenization + payment
      setTimeout(() => {
        setApplePayState('idle');
        doPayment();
      }, 900);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Paiement sécurisé</h1>
      <p className="text-sm text-text-secondary">
        Choisissez votre méthode de paiement pour finaliser votre réservation.
      </p>

      {initiatorMismatch && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#B85450]/40 bg-[#B85450]/12 p-4 backdrop-blur-md">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#8B3A3A]" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-[#8B3A3A]">
              Compte différent détecté
            </p>
            <p className="mt-1 text-text-secondary">
              Ce QR code a été initié pour&nbsp;
              <span className="font-medium text-text-primary">{initiatorMismatch.initiator}</span>
              &nbsp;mais vous êtes connecté en tant que&nbsp;
              <span className="font-medium text-text-primary">{initiatorMismatch.current}</span>.
              Reconnectez-vous avec le bon compte pour continuer.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-text-primary">Récapitulatif</h2>
            <dl className="mt-4 divide-y divide-white/40 text-sm">
              <Row label="Parking" value={summary.parkingName} />
              <Row label="Place" value={summary.spot || '—'} />
              <Row label="Date" value={summary.date || '—'} />
              <Row label="Début" value={summary.startTime || '—'} />
              <Row label="Fin" value={summary.endTime || '—'} />
              <Row label="Durée" value={`${summary.duration} h`} />
            </dl>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#FAB95B]/35 bg-[#FAB95B]/12 p-4">
              <span className="text-sm font-medium text-text-secondary">Total</span>
              <span className="text-2xl font-bold tracking-tight text-[#1A1F2E]">
                {formatCurrency(summary.total)}
              </span>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-text-muted">
              <Lock className="h-3.5 w-3.5" /> Paiement chiffré SSL
            </p>
          </div>
        </aside>

        <section className="lg:col-span-3">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-text-primary">Méthode de paiement</h2>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {([
                { id: 'CARTE', label: 'Carte', icon: CreditCard },
                { id: 'MOBILE', label: 'Mobile', icon: Smartphone },
                { id: 'VIREMENT', label: 'Virement', icon: Building2 },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all',
                    method === id
                      ? 'border-[#FAB95B] bg-[#FAB95B]/15 text-[#1A1F2E] shadow-md shadow-[#FAB95B]/25'
                      : 'border-white/50 bg-white/40 text-text-secondary hover:border-[#FAB95B]/45',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>

            {/* ============== CARTE ============== */}
            {method === 'CARTE' && (
              <form onSubmit={handleSubmit(onCardSubmit)} className="mt-6 space-y-4">
                <Input
                  label="Nom du titulaire"
                  placeholder="Yousra Ouhajou"
                  {...register('cardName')}
                  error={errors.cardName?.message}
                />
                <Input
                  label="Numéro de carte"
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  {...register('cardNumber')}
                  error={errors.cardNumber?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date d'expiration"
                    placeholder="MM/AA"
                    {...register('expiry')}
                    error={errors.expiry?.message}
                  />
                  <Input
                    label="CVV"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    {...register('cvv')}
                    error={errors.cvv?.message}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={submitting}
                  disabled={!!initiatorMismatch}
                >
                  Payer {formatCurrency(summary.total)}
                </Button>

                {/* Apple Pay — mobile only, simulé */}
                <div className="md:hidden">
                  <div className="my-4 flex items-center gap-3 text-xs text-text-muted">
                    <span className="h-px flex-1 bg-white/55" />
                    ou
                    <span className="h-px flex-1 bg-white/55" />
                  </div>
                  <button
                    type="button"
                    onClick={triggerApplePay}
                    disabled={
                      !!initiatorMismatch || submitting || applePayState !== 'idle'
                    }
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-black font-semibold text-white shadow-lg transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    aria-label="Payer avec Apple Pay"
                  >
                    {applePayState === 'authing' && (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                        Authentification…
                      </span>
                    )}
                    {applePayState === 'processing' && (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                        Validation du paiement…
                      </span>
                    )}
                    {applePayState === 'idle' && (
                      <>
                        <AppleLogo className="h-5 w-5" />
                        <span className="text-base">Pay</span>
                      </>
                    )}
                    {/* subtle gloss */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
                  <p className="mt-2 text-center text-[11px] text-text-muted">
                    Démo — paiement simulé, aucune vraie transaction.
                  </p>
                </div>
              </form>
            )}

            {/* ============== MOBILE — QR ============== */}
            {method === 'MOBILE' && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col items-center gap-4 rounded-xl border border-white/50 bg-white/65 p-6 text-center backdrop-blur-md">
                  <div className="rounded-xl bg-white p-3 shadow-md">
                    {mobileUrl ? (
                      <QRCodeSVG
                        value={mobileUrl}
                        size={184}
                        level="M"
                        fgColor="#1A1F2E"
                        bgColor="#FFFFFF"
                      />
                    ) : (
                      <div className="skeleton h-[184px] w-[184px]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Continuez sur votre mobile
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-text-secondary">
                      Scannez ce QR code avec votre téléphone pour finaliser le paiement.
                      Votre téléphone doit être sur le même Wi-Fi.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={doPayment}
                  loading={submitting}
                  disabled={!!initiatorMismatch}
                >
                  Confirmer le paiement de {formatCurrency(summary.total)}
                </Button>
              </div>
            )}

            {/* ============== VIREMENT ============== */}
            {method === 'VIREMENT' && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-white/50 bg-white/55 p-5 text-sm text-text-secondary backdrop-blur-md">
                  <p className="font-semibold text-text-primary">
                    Effectuez un virement vers&nbsp;:
                  </p>
                  <dl className="mt-3 space-y-1.5">
                    <DescRow label="Bénéficiaire" value="Smart Parking SARL" />
                    <DescRow label="IBAN" value="MA64 1234 5678 9012 3456 7890 1234" />
                    <DescRow label="BIC" value="BCMAMAMC" />
                    <DescRow label="Référence" value={summary.parkingName + ' / ' + summary.spot} />
                  </dl>
                  <p className="mt-3 text-xs text-text-muted">
                    Votre réservation sera confirmée à réception. Conservez la référence.
                  </p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={doPayment}
                  loading={submitting}
                  disabled={!!initiatorMismatch}
                >
                  J&apos;ai effectué le virement — confirmer {formatCurrency(summary.total)}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.06 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function DescRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <dt className="text-xs uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className="break-all text-right font-mono text-xs text-text-primary">{value}</dd>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="skeleton h-72 w-full" /></div>}>
      <PaymentInner />
    </Suspense>
  );
}
