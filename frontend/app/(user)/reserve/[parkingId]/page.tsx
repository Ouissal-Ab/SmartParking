'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MapPin, ChevronLeft, Check, Wifi, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { toParking, type BackendParking, type BackendPlace } from '@/lib/adapters';
import type { Parking } from '@/types/parking';
import { ReservationStepper } from '@/components/reservation/ReservationStepper';
import { BackendSpotSelector } from '@/components/reservation/BackendSpotSelector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { useLivePlaces } from '@/lib/hooks/useLivePlaces';
import type { PlaceUpdate } from '@/lib/realtime';
import { getStoredUser } from '@/lib/auth';

const steps = [{ label: 'Place & horaire' }, { label: 'Récapitulatif' }, { label: 'Paiement' }];

const ALL_DURATIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 24] as const;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(total: number): string {
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function ReservePage() {
  const params = useParams<{ parkingId: string }>();
  const router = useRouter();
  const parkingId = Number(params.parkingId);

  const [parking, setParking] = useState<Parking | null>(null);
  const [places, setPlaces] = useState<BackendPlace[]>([]);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<BackendPlace | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(2);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: p }, { data: pl }] = await Promise.all([
          api.get<BackendParking>(`/user/parkings/${parkingId}`),
          api.get<BackendPlace[]>(`/places/parking/${parkingId}`),
        ]);
        if (cancelled) return;
        const free = pl.filter((x) => x.statut === 'LIBRE').length;
        const parkingObj = toParking(p, free);
        setParking(parkingObj);
        setPlaces(pl);
        // Clamp startTime within opening hours when first loading
        const openM = timeToMinutes(parkingObj.openTime);
        const startM = timeToMinutes(startTime);
        if (startM < openM) {
          setStartTime(parkingObj.openTime);
        }
      } catch {
        // leave nullable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parkingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLive = useCallback(
    (u: PlaceUpdate) => {
      if (u.parkingId !== parkingId) return;
      setPlaces((prev) => prev.map((p) => (p.id === u.id ? { ...p, statut: u.statut } : p)));
      setSpot((current) =>
        current && current.id === u.id && u.statut !== 'LIBRE' ? null : current,
      );
    },
    [parkingId],
  );
  useLivePlaces(onLive);

  // === Closing-time validation ===
  const { maxDuration, closingViolation, availableDurations } = useMemo(() => {
    if (!parking) {
      return {
        maxDuration: 24,
        closingViolation: false,
        availableDurations: [...ALL_DURATIONS] as number[],
      };
    }
    const openM = timeToMinutes(parking.openTime);
    let closeM = timeToMinutes(parking.closeTime);
    // Treat "00:00" close as end of day so 24h parkings work
    if (closeM === 0) closeM = 24 * 60;
    const startM = timeToMinutes(startTime);

    // Out-of-hours start
    if (startM < openM || startM >= closeM) {
      return { maxDuration: 0, closingViolation: true, availableDurations: [] };
    }
    const maxMins = closeM - startM;
    const maxHours = Math.floor(maxMins / 60);
    const filtered = ALL_DURATIONS.filter((h) => h <= maxHours);
    return {
      maxDuration: maxHours,
      closingViolation: false,
      availableDurations: filtered,
    };
  }, [parking, startTime]);

  // Auto-clamp duration when it no longer fits
  useEffect(() => {
    if (availableDurations.length === 0) return;
    if (!availableDurations.includes(duration)) {
      setDuration(availableDurations[availableDurations.length - 1]);
    }
  }, [availableDurations, duration]);

  const endTimeStr = useMemo(
    () => minutesToTime(timeToMinutes(startTime) + duration * 60),
    [startTime, duration],
  );

  const total = useMemo(() => {
    if (!parking) return 0;
    return parking.hourlyRate * duration;
  }, [parking, duration]);

  const canNext =
    step === 0
      ? !!spot && !closingViolation && availableDurations.length > 0
      : true;

  const goNext = () => {
    if (step === 0 && (!spot || closingViolation || availableDurations.length === 0)) return;
    if (step === 2) {
      const me = getStoredUser();
      const params = new URLSearchParams({
        parkingId: String(parkingId),
        parkingName: parking?.name || '',
        spot: spot?.numero || '',
        date,
        startTime,
        endTime: endTimeStr,
        duration: String(duration),
        total: String(total),
      });
      if (me?.email) params.set('initiator', me.email);
      router.push(`/payment?${params.toString()}`);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  if (!parking) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="skeleton h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour
      </button>

      <div className="glass-card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Réserver une place
          </h1>
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            {parking.name}
            <span className="flex items-center gap-1 text-xs text-[#7A4F0E]">
              <Wifi className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">disponibilité en direct</span>
            </span>
          </p>
        </div>

        <div className="mb-8">
          <ReservationStepper steps={steps} currentStep={step} />
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-white/50 bg-white/40 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">{parking.name}</p>
            <p className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin className="h-3.5 w-3.5" />
              {parking.address}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Ouvert de {parking.openTime} à {parking.closeTime}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Tarif horaire</p>
            <p className="text-lg font-bold text-[#1A1F2E]">
              {formatCurrency(parking.hourlyRate)} / h
            </p>
          </div>
        </div>

        {step === 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-text-primary">
                Choisissez une place ({places.filter((p) => p.statut === 'LIBRE').length} libres)
              </p>
              <BackendSpotSelector places={places} selectedId={spot?.id ?? null} onSelect={setSpot} />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-text-primary">
                Définissez votre horaire
              </p>
              <div className="space-y-4">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  label="Heure de début"
                  type="time"
                  value={startTime}
                  min={parking.openTime}
                  max={parking.closeTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />

                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="duration" className="text-sm font-medium text-text-primary">
                    Durée
                  </label>
                  {availableDurations.length === 0 ? (
                    <p className="rounded-lg border border-[#B85450]/40 bg-[#B85450]/10 px-3 py-2 text-xs text-[#8B3A3A]">
                      L&apos;heure choisie est en dehors des horaires
                      d&apos;ouverture ({parking.openTime} – {parking.closeTime}).
                    </p>
                  ) : (
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-white/55 bg-white/55 px-3 text-sm text-text-primary backdrop-blur-md transition-all focus:border-[#FAB95B] focus:bg-white/75 focus:outline-none focus:ring-2 focus:ring-[#FAB95B]/30"
                    >
                      {availableDurations.map((h) => (
                        <option key={h} value={h}>
                          {h === 1 ? '1 heure' : `${h} heures`}
                        </option>
                      ))}
                    </select>
                  )}
                  {availableDurations.length > 0 && availableDurations.length < ALL_DURATIONS.length && (
                    <p className="flex items-center gap-1 text-[11px] text-text-muted">
                      <AlertTriangle className="h-3 w-3" />
                      Limité à {maxDuration}&nbsp;h — le parking ferme à {parking.closeTime}.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-[#FAB95B]/35 bg-[#FAB95B]/12 p-4 backdrop-blur-md">
                  <p className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="h-3.5 w-3.5" /> Total estimé · Fin à {endTimeStr}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-xl border border-white/50 bg-white/40 p-6 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-text-primary">
              Récapitulatif de votre réservation
            </h2>
            <dl className="mt-4 divide-y divide-white/40">
              <Row label="Parking" value={parking.name} />
              <Row label="Adresse" value={parking.address} />
              <Row label="Place" value={spot?.numero ?? '—'} />
              <Row label="Date" value={date} />
              <Row label="Heure de début" value={startTime} />
              <Row label="Heure de fin" value={endTimeStr} />
              <Row label="Durée" value={`${duration} heure${duration > 1 ? 's' : ''}`} />
              <Row label="Tarif horaire" value={formatCurrency(parking.hourlyRate)} />
              <Row label="Total à payer" value={formatCurrency(total)} highlight />
            </dl>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl border border-[#FAB95B]/40 bg-[#FAB95B]/15 p-8 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAB95B] text-[#1A1F2E] shadow-md">
              <Check className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-text-primary">Tout est prêt !</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Cliquez sur « Procéder au paiement » pour finaliser votre
              réservation et régler le montant de {formatCurrency(total)}.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            Précédent
          </Button>
          <Button onClick={goNext} disabled={!canNext}>
            {step === steps.length - 1 ? 'Procéder au paiement' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd
        className={
          highlight
            ? 'text-xl font-bold tracking-tight text-[#7A4F0E]'
            : 'text-sm font-medium text-text-primary'
        }
      >
        {value}
      </dd>
    </div>
  );
}
