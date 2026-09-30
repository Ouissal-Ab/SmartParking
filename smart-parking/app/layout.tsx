import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Parking — Réservation de places de parking',
  description: 'Trouvez et réservez votre place de parking en quelques secondes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.85)',
              color: '#1A1F2E',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '0.875rem',
              padding: '12px 16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(26, 31, 46, 0.08)',
            },
            success: { iconTheme: { primary: '#1A3263', secondary: '#FAB95B' } },
            error: { iconTheme: { primary: '#B85450', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
