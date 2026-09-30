'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone } from 'lucide-react';

interface Props {
  /** Path to deep-link into. Defaults to the current page path. */
  path?: string;
  /** Square size in px for the rendered QR. */
  size?: number;
  /** Show the label/caption beside the code. */
  label?: string;
  /** Optional hint shown under the label. */
  hint?: string;
  /** Layout: 'row' (side by side) or 'column'. */
  layout?: 'row' | 'column';
}

export function MobileHandoffQR({
  path,
  size = 168,
  label = 'Continuer sur mobile',
  hint = 'Scannez ce QR code avec votre téléphone — assurez-vous qu’il soit connecté au même Wi-Fi.',
  layout = 'row',
}: Props) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = new URL(path || window.location.pathname, window.location.origin);

    fetch('/api/lan-ip')
      .then((r) => (r.ok ? r.json() : { ip: null }))
      .then(({ ip }) => {
        if (ip && (target.hostname === 'localhost' || target.hostname === '127.0.0.1')) {
          target.hostname = ip;
        }
        setUrl(target.toString());
      })
      .catch(() => setUrl(target.toString()));
  }, [path]);

  const isRow = layout === 'row';

  return (
    <div
      className={`flex items-center gap-5 rounded-2xl border border-white/55 bg-white/55 p-5 backdrop-blur-md ${
        isRow ? 'flex-col sm:flex-row sm:text-left' : 'flex-col text-center'
      }`}
    >
      <div className="rounded-xl bg-white p-3 shadow-md">
        {url ? (
          <QRCodeSVG
            value={url}
            size={size}
            level="M"
            fgColor="#1A1F2E"
            bgColor="#FFFFFF"
          />
        ) : (
          <div className="skeleton" style={{ width: size, height: size }} />
        )}
      </div>
      <div className={`max-w-xs ${isRow ? 'text-center sm:text-left' : 'text-center'}`}>
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7A4F0E] sm:justify-start">
          <Smartphone className="h-3.5 w-3.5" />
          {label}
        </p>
        <p className="mt-2 text-sm text-text-secondary">{hint}</p>
      </div>
    </div>
  );
}
