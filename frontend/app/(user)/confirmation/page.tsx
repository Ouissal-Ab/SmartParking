'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Download, Home, Calendar, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

function ConfirmationInner() {
  const search = useSearchParams();

  const summary = useMemo(
    () => ({
      parkingName: search.get('parkingName') || 'Parking',
      spot: search.get('spot') || '',
      date: search.get('date') || '',
      startTime: search.get('startTime') || '',
      duration: Number(search.get('duration') || 0),
      total: Number(search.get('total') || 0),
      reference: search.get('reference') || 'SP-000000',
    }),
    [search],
  );

  const downloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Smart Parking', 20, 24);
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text('Reçu de réservation', 20, 32);
    doc.setDrawColor(220, 210, 190);
    doc.line(20, 38, 190, 38);

    doc.setTextColor(40, 40, 40);
    const lines: [string, string][] = [
      ['Référence', summary.reference],
      ['Parking', summary.parkingName],
      ['Place', summary.spot],
      ['Date', summary.date],
      ['Heure de début', summary.startTime],
      ['Durée', `${summary.duration} heure(s)`],
      ['Montant payé', formatCurrency(summary.total)],
    ];
    let y = 52;
    lines.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${k}`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(v, 80, y);
      y += 11;
    });
    doc.line(20, y + 2, 190, y + 2);
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.text('Merci pour votre confiance — Smart Parking.', 20, y + 14);
    doc.save(`recu-${summary.reference}.pdf`);
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-10 sm:px-6">
      {/* Confetti rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FAB95B]/25 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/4 -z-10 h-48 w-48 rounded-full bg-[#1A3263]/12 blur-3xl" />

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-[#FAB95B] text-[#1A1F2E] shadow-xl shadow-[#FAB95B]/45"
      >
        <Check className="h-12 w-12" strokeWidth={3} />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1A3263] text-[#FAB95B] shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-8 text-center font-display text-4xl font-extrabold tracking-tight text-text-primary"
      >
        Réservation <span className="gradient-text">confirmée</span>&nbsp;!
      </motion.h1>
      <p className="mt-3 text-center text-sm text-text-secondary">
        Un reçu a été généré. Téléchargez-le pour vos archives.
      </p>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="glass-card mt-8 w-full p-6"
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/40 pb-3">
          <p className="text-sm text-text-secondary">Référence</p>
          <p className="font-mono text-sm font-bold text-text-primary">{summary.reference}</p>
        </div>
        <dl className="space-y-3 text-sm">
          <Row label="Parking" value={summary.parkingName} />
          <Row label="Place" value={summary.spot || '—'} />
          <Row label="Date & heure" value={`${summary.date} à ${summary.startTime}`} />
          <Row label="Durée" value={`${summary.duration} heure(s)`} />
          <div className="mt-3 flex items-center justify-between border-t border-white/40 pt-3">
            <dt className="text-sm text-text-secondary">Montant payé</dt>
            <dd className="text-2xl font-extrabold tracking-tight text-[#7A4F0E]">
              {formatCurrency(summary.total)}
            </dd>
          </div>
        </dl>
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex w-full flex-col gap-3 sm:flex-row"
      >
        <Button onClick={downloadReceipt} size="lg" className="flex-1">
          <Download className="h-4 w-4" />
          Télécharger le reçu
        </Button>
        <Link href="/reservations" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">
            <Calendar className="h-4 w-4" />
            Mes réservations
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button variant="ghost" size="lg" className="w-full">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="skeleton h-72 w-full" /></div>}>
      <ConfirmationInner />
    </Suspense>
  );
}
