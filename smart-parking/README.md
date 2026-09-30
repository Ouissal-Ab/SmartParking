# Smart Parking — Frontend

Frontend Next.js 14 (App Router) pour l'application Smart Parking. Interface entièrement en français.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Configuration

Créez un fichier `.env.local` (déjà inclus) :

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Stack technique

- Next.js 14 (App Router) + TypeScript
- TailwindCSS — palette beige + slate
- Axios, react-hook-form + zod
- Recharts (graphiques)
- Leaflet + react-leaflet (carte interactive)
- Framer Motion (animations)
- react-hot-toast (notifications)
- jsPDF (génération de reçus)

## Données de test

Tous les appels API se replient sur des données fictives (`lib/mock.ts`) si le
backend n'est pas joignable. L'interface fonctionne donc même sans le backend
Spring Boot.

## Pages

| Route | Rôle |
|---|---|
| `/` | Page d'accueil publique |
| `/login` | Connexion |
| `/register` | Inscription |
| `/dashboard` | Carte interactive (utilisateur) |
| `/reserve/[id]` | Processus de réservation 3 étapes |
| `/payment` | Paiement sécurisé |
| `/confirmation` | Confirmation + reçu PDF |
| `/reservations` | Mes réservations |
| `/admin` | Tableau de bord administrateur |
| `/admin/parkings` | Gestion des parkings |
| `/admin/reservations` | Toutes les réservations |
| `/admin/users` | Gestion des utilisateurs |
