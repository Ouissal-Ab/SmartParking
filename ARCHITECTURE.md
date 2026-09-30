# 🏗️ Smart Parking — Architecture du code

Document technique destiné aux développeurs. Il complète `INSTALLATION.md` en expliquant **où se trouve quoi**, comment les briques communiquent, et comment fonctionne le **temps réel par WebSocket**.

---

## 1. Vue d'ensemble

```
┌─────────────────┐    HTTP REST (Axios, JWT)     ┌───────────────────────┐
│                 │ ─────────────────────────────▶ │                       │
│  Next.js 14     │                                │  Spring Boot 3        │
│  Frontend       │ ◀───────────────────────────── │  Backend              │
│  (React 18)     │    JSON                        │  + JPA / Hibernate    │
│                 │                                │                       │
│                 │    STOMP / SockJS (/ws)        │                       │
│                 │ ◀══════════════════════════════▶                       │
└─────────────────┘    Mises à jour live           └───────────┬───────────┘
                                                               │
                                                               │ JDBC
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │   PostgreSQL 14+     │
                                                    │   smartparking       │
                                                    └──────────────────────┘
```

| Brique | Port | Rôle |
|---|---|---|
| Frontend Next.js | `3000` (ou 3001/3002 si occupé) | Pages utilisateur + admin, hooks, WebSocket client |
| Backend Spring Boot | `8080` | API REST + endpoint STOMP `/ws` + JWT |
| PostgreSQL | `5432` | Base `smartparking` |

---

## 2. Frontend — Arborescence des fichiers

```
smart-parking/
├── app/                              ← App Router Next.js 14
│   ├── layout.tsx                    ← Layout racine (police, Toaster, Leaflet CSS)
│   ├── globals.css                   ← Design system (glassmorphism, mesh, etc.)
│   ├── api/
│   │   └── lan-ip/route.ts           ← Route serveur Next.js qui renvoie l'IP LAN
│   ├── (public)/                     ← Route group : pages publiques
│   │   ├── page.tsx                  ← Landing page (/)
│   │   ├── login/page.tsx            ← /login
│   │   └── register/page.tsx         ← /register
│   ├── (user)/                       ← Route group : pages utilisateur connecté
│   │   ├── layout.tsx                ← Layout : Navbar + MeshBackdrop
│   │   ├── dashboard/page.tsx        ← /dashboard (carte + liste, live)
│   │   ├── reservations/page.tsx     ← /reservations (historique)
│   │   ├── reserve/[parkingId]/page.tsx  ← /reserve/123 (stepper 3 étapes)
│   │   ├── payment/page.tsx          ← /payment (carte, mobile QR, virement, Apple Pay)
│   │   └── confirmation/page.tsx     ← /confirmation (succès + PDF jsPDF)
│   └── (admin)/                      ← Route group : pages admin (rôle ADMIN requis)
│       ├── layout.tsx                ← Layout : AdminSidebar
│       ├── admin/page.tsx            ← /admin (KPIs + graphiques)
│       ├── admin/parkings/page.tsx   ← /admin/parkings (CRUD + progress bar)
│       ├── admin/reservations/page.tsx
│       └── admin/users/page.tsx      ← Modale rôle, recherche
│
├── components/
│   ├── ui/                           ← Primitives réutilisables
│   │   ├── Button.tsx                ← bouton or solide, variants primary/danger/etc.
│   │   ├── Input.tsx                 ← input glassmorphism
│   │   ├── Card.tsx
│   │   ├── Badge.tsx                 ← variants success/warning/danger/info/neutral
│   │   ├── Modal.tsx                 ← modale Framer Motion (Escape, click-outside)
│   │   ├── Table.tsx                 ← tableau générique (colonnes, skeleton, empty)
│   │   └── StatCard.tsx              ← carte KPI avec icône colorée
│   ├── layout/
│   │   ├── Navbar.tsx                ← navbar utilisateur (sticky, scroll-aware)
│   │   ├── AdminSidebar.tsx          ← sidebar admin (slate-900, hover or)
│   │   ├── Footer.tsx
│   │   ├── MeshBackdrop.tsx          ← fond animé navy/or (4 blobs flottants)
│   │   └── AuthBackdrop.tsx          ← version simplifiée pour login/register
│   ├── parking/
│   │   ├── ParkingMap.tsx            ← carte Leaflet (markers personnalisés SVG)
│   │   ├── ParkingCard.tsx           ← carte d'un parking avec progress bar
│   │   ├── ParkingModal.tsx          ← formulaire add/edit parking (zod)
│   │   └── AvailabilityBadge.tsx     ← badge Disponible / Presque complet / Complet
│   ├── reservation/
│   │   ├── ReservationStepper.tsx    ← 3 étapes avec coche verte
│   │   ├── BackendSpotSelector.tsx   ← grille des places (statut backend)
│   │   ├── SpotSelector.tsx          ← (legacy, conservé pour compat)
│   │   └── ReservationCard.tsx
│   ├── charts/
│   │   ├── OccupancyChart.tsx        ← PieChart Recharts (occupation)
│   │   └── ReservationTrend.tsx      ← LineChart Recharts (tendance 7j)
│   └── MobileHandoffQR.tsx           ← QR code pour passer du desktop au mobile
│
├── lib/                              ← Logique pure / utilitaires
│   ├── api.ts                        ← Client Axios + intercepteurs (JWT, 401)
│   ├── auth.ts                       ← login(), saveSession(), getStoredUser()
│   ├── adapters.ts                   ← Conversion DTO backend ↔ types frontend
│   ├── realtime.ts                   ← Client STOMP singleton (WebSocket)
│   ├── utils.ts                      ← cn(), formatCurrency (MAD), formatDate, etc.
│   ├── mock.ts                       ← Fallback data si API indisponible
│   └── hooks/
│       └── useLivePlaces.ts          ← Hook React qui s'abonne à /topic/places
│
├── types/                            ← Types TypeScript de l'UI
│   ├── parking.ts                    ← interface Parking { name, totalSpots, ... }
│   ├── reservation.ts                ← Reservation, ReservationStatus
│   └── user.ts                       ← User, UserRole
│
├── middleware.ts                     ← Middleware Edge (redirige selon role+token)
├── next.config.js
├── tailwind.config.ts                ← Palette or / navy / pearl
├── tsconfig.json
├── .env.local                        ← NEXT_PUBLIC_API_URL=http://localhost:8080
└── package.json
```

### 2.1 Conventions

- **Composants** : PascalCase (`Button.tsx`).
- **Hooks / utilitaires** : camelCase (`useLivePlaces.ts`).
- **Pages** : nom de dossier kebab, fichier `page.tsx`.
- **Variables et fonctions** : anglais. **Tous les libellés visibles par l'utilisateur** : français.

### 2.2 Pourquoi des « route groups » `(public)`, `(user)`, `(admin)` ?

Les parenthèses en App Router permettent de **regrouper des pages sans préfixer l'URL**. Elles servent surtout à fournir un **layout dédié** :

- `(public)/page.tsx` → URL `/` (pas de sidebar ni navbar)
- `(user)/layout.tsx` → wrap chaque page utilisateur avec `<Navbar />`
- `(admin)/layout.tsx` → wrap chaque page admin avec `<AdminSidebar />`

---

## 3. Authentification

Flux de connexion (`lib/auth.ts` → `login()`) :

```
1. POST /auth/login  →  { token, role, prenom, nom, email }
2. localStorage      ←  token, user
3. cookies            ←  token (lu par middleware Edge)
                        role  (lu par middleware Edge)
4. GET /user/profile  ←  données complètes (téléphone, immatriculation)
5. Page redirige     →  /dashboard (USER) ou /admin (ADMIN)
                        avec window.location.href (hard nav)
                        pour que les cookies soient bien vus
                        par le middleware sur mobile
```

**Pourquoi à la fois localStorage ET cookies ?**
- `localStorage` → lu côté client par `axios` pour mettre `Authorization: Bearer …`
- `cookies` → lu côté serveur par `middleware.ts` (qui s'exécute en Edge) pour décider de la redirection avant le rendu

Le JWT contient le claim `role` (depuis Spring `JwtService.generateToken(email, role)`). Le frontend décode cette claim côté client (`lib/auth.getRoleFromToken`) mais le middleware utilise plutôt le **cookie `role`** pour éviter de décoder le JWT en Edge.

---

## 4. Couche d'adaptation backend ↔ frontend

Le backend renvoie ses champs en **français** (`nom`, `adresse`, `nombreDePlaces`…), le frontend type ses objets en **anglais** (`name`, `address`, `totalSpots`…). Pour ne pas polluer chaque composant avec des `parking.nom`, on traverse une fonction d'adaptation : **`lib/adapters.ts`**.

| Backend (Spring) | Frontend (TS) |
|---|---|
| `nom` | `name` |
| `adresse` | `address` |
| `nombreDePlaces` | `totalSpots` |
| `tarifParHeure` | `hourlyRate` |
| `heureOuverture / heureFermeture` | `openTime / closeTime` |
| `dateReservation + heureDebut` (LocalDate + LocalTime) | `startTime` (ISO datetime) |
| `statut: EN_ATTENTE/ACTIVE/TERMINEE/ANNULEE` | `status: ACTIVE / COMPLETED / CANCELLED` |
| `role: ROLE_ADMIN / ROLE_USER` | `role: ADMIN / USER` |
| `latitude/longitude: null` | fallback aléatoire autour de Marrakech |

Chaque page fait `api.get('/user/parkings')` puis `toParking(b, availableSpots)` pour obtenir un objet `Parking` typé.

---

## 5. API client (`lib/api.ts`)

```ts
const api = axios.create({ baseURL: computeBaseUrl(), withCredentials: true });
```

`computeBaseUrl()` est **dynamique** :
- Si la page est servie sur `localhost` → API = `http://localhost:8080`
- Si la page est servie sur une IP LAN (mobile) → API = `http://<même-IP>:8080`

Cela permet à un téléphone qui scanne le QR du desktop d'appeler le backend sans config manuelle.

Deux intercepteurs :
- **Request** : ajoute `Authorization: Bearer <token>` depuis `localStorage`
- **Response** : sur `401`, nettoie la session et redirige vers `/login`

---

## 6. Middleware Edge (`middleware.ts`)

Tourne sur l'**Edge runtime** (avant le rendu de la page). Lit les cookies, décide de la redirection :

```ts
matcher: ['/admin/:path*', '/dashboard', '/reserve/:path*', '/reservations', '/payment', '/confirmation']
```

- `/admin/*` → cookie `role` doit être `ADMIN`, sinon redirige `/dashboard`
- Routes utilisateur → cookie `token` requis, sinon redirige `/login?redirect=<url-origine>`

Le paramètre `redirect` est honoré par la page `/login` après authentification (utile quand on scanne un QR de paiement sur mobile : retour direct à `/payment?...`).

---

## 7. WebSocket — Temps réel

C'est la partie la plus subtile. Disponibilité des places mise à jour **instantanément** sur tous les clients connectés (carte du dashboard, grille `/reserve/[id]`) sans rafraîchir.

### 7.1 — Pile technique

| Couche | Backend | Frontend |
|---|---|---|
| Protocole | **STOMP over SockJS** | idem |
| Lib | `spring-boot-starter-websocket` (Tomcat) | `@stomp/stompjs` + `sockjs-client` |
| Endpoint | `ws://<host>:8080/ws` (avec fallbacks SockJS) | `webSocketFactory: () => new SockJS(...)` |
| Broker | `enableSimpleBroker("/topic")` | `subscribe("/topic/places", cb)` |

### 7.2 — Topics

| Topic | Émis par | Payload | Abonnés |
|---|---|---|---|
| `/topic/places` | `PlaceRealtimePublisher.sendPlaceUpdate()` | `{ id, numero, statut, parkingId }` | Dashboard user, Reserve, Dashboard admin |
| `/topic/reservations` | `PlaceRealtimePublisher.sendReservationCreated()` | `{ id, code, dateReservation, heureDebut, heureFin, montantTotal, statut, user, parking, place }` | Admin reservations, Dashboard admin |
| `/topic/stats` | `PlaceRealtimePublisher.sendParkingStats()` | (libre) | Réservé pour usage futur |

### 7.3 — Chaîne complète d'une mise à jour

Quand l'utilisateur Marie réserve la place P12 du Parking IA :

```
   Frontend Marie                Backend                    Frontend Lucas (autre onglet)
   ───────────────              ───────────                ────────────────────────────────
1. POST /user/reserve  ───────▶
                                ReservationService
                                .createFromRequest()
                                ├── place.statut=RESERVE
                                ├── placeRepository.save()
                                └── placeRealtimePublisher
                                    .sendPlaceUpdate(savedPlace)
                                         │
                                         ▼
                                ┌─────────────────────┐
                                │ STOMP /topic/places │
                                │ { id: 7, numero:    │
                                │   "P12", statut:    │
                                │   "RESERVE",        │
                                │   parkingId: 3 }    │
                                └──────────┬──────────┘
                                           │ broadcast
                       ────────────────────┴────────────────────
                       │                                       │
2. Réponse HTTP 200 ◀──┘                                       ▼
3. Marie route vers /payment                       useLivePlaces(handler)
                                                    └─ setPlaces(prev =>
                                                          prev.map(p => p.id===7
                                                            ? {...p, statut:"RESERVE"}
                                                            : p))
                                                   → la grille se met à jour
                                                   → la carte du dashboard recompte
                                                     les places disponibles
```

### 7.4 — Trois sources de publication côté backend

1. **`ReservationService.createFromRequest()`** — après la sauvegarde d'une place en `RESERVE` lors d'une nouvelle réservation.
2. **`PlaceService.updateStatus()`** — quand un admin modifie manuellement le statut d'une place via `PUT /places/parking/{id}/{numero}?statut=...`.
3. **`ReservationScheduler.updateReservations()`** — toutes les 60 s, marque les réservations expirées comme `TERMINEE` et libère leur place (`LIBRE`).

### 7.5 — Client singleton (`lib/realtime.ts`)

Un seul `Client` STOMP partagé pour toute l'app — n'ouvre la connexion qu'à la première souscription :

```ts
const client = new Client({
  webSocketFactory: () => new SockJS('http://<host>:8080/ws'),
  reconnectDelay: 3000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
});
```

- `reconnectDelay` : se reconnecte automatiquement après 3 s en cas de perte.
- `heartbeat` : ping de chaque côté pour détecter les déconnexions silencieuses (Wi-Fi mobile coupé, etc.).
- Re-souscrit aux topics actifs après reconnexion (logique dans `c.onConnect`).

L'API publique du module :

```ts
function subscribeTopic<T>(topic: string, handler: (msg: T) => void): () => void
```

Retourne une fonction `unsubscribe`. Plusieurs handlers peuvent s'abonner au même topic — un seul `subscribe` STOMP est ouvert, et tous les callbacks reçoivent les messages.

### 7.6 — Hook React (`lib/hooks/useLivePlaces.ts`)

```ts
export function useLivePlaces(handler: (u: PlaceUpdate) => void) {
  useEffect(() => {
    const unsub = subscribeTopic<PlaceUpdate>('/topic/places', handler);
    return unsub;
  }, [handler]);
}
```

Le handler doit être **stable** entre rendus (utilisez `useCallback`) sinon il se réabonne à chaque rendu et perd les messages.

### 7.7 — Exemple d'utilisation (dashboard)

```ts
const onLive = useCallback((u: PlaceUpdate) => {
  if (u.parkingId == null) return;
  setPlacesByParking((prev) => {
    // 1. Met à jour le statut de la place
    const next = new Map(prev);
    const list = next.get(u.parkingId!)!.map(p =>
      p.id === u.id ? { ...p, statut: u.statut } : p
    );
    next.set(u.parkingId!, list);
    // 2. Recompte les places libres pour ce parking
    const freeCount = list.filter(p => p.statut === 'LIBRE').length;
    setParkings(parks =>
      parks.map(pk => pk.id === u.parkingId ? { ...pk, availableSpots: freeCount } : pk)
    );
    return next;
  });
}, []);
useLivePlaces(onLive);
```

Sur `/reserve/[id]` la même logique filtre sur le `parkingId` courant et **déselectionne automatiquement** la place si quelqu'un d'autre vient de la prendre pendant que l'utilisateur configurait son horaire.

### 7.8 — Sécurité / CORS WebSocket

Le endpoint `/ws` est marqué `permitAll` dans `SecurityConfig`. Pas de JWT requis pour s'y connecter (le but du temps réel ici est d'observer la disponibilité publique, pas d'opération sensible). Si vous voulez authentifier le STOMP, voir `setHandshakeHandler()` côté Spring.

CORS : `setAllowedOriginPatterns(List.of("*"))` en dev. À durcir en prod.

---

## 8. Design System (`app/globals.css` + `tailwind.config.ts`)

### Palette

| Token | Hex | Rôle |
|---|---|---|
| `--gold` | `#FAB95B` | Primaire (CTA, focus, sélection) |
| `--gold-dk` | `#D49543` | Hover du primaire |
| `--navy` | `#1A3263` | Secondaire (texte foncé, sidebar admin) |
| `--steel` | `#547792` | Tertiaire (éléments discrets) |
| `--pearl` | `#E8E2DB` | Surface principale |
| `--accent-rose` | `#B85450` | Danger (suppression) |

### Classes utilitaires

- `.glass` / `.glass-card` / `.glass-pill` — fond translucide + `backdrop-blur` + ombres soft
- `.mesh-bg` — 4 blobs colorés (or, or-foncé, steel) animés en flottement infini
- `.grain` — texture SVG en overlay (papier mat)
- `.gradient-text` — texte avec dégradé or → or-foncé → navy
- `.grid-pattern` — grille translucide avec masque radial
- `.tilt` — léger effet 3D au hover

---

## 9. Génération du QR de handoff mobile

Composant : `components/MobileHandoffQR.tsx`.

```ts
1. Récupère window.location.pathname
2. fetch('/api/lan-ip') → { ip: "192.168.x.x" }
3. Remplace localhost par cette IP dans l'URL
4. Rend un <QRCodeSVG value={url} /> avec qrcode.react
```

`app/api/lan-ip/route.ts` est une **route serveur Next.js** (Node runtime) qui lit `os.networkInterfaces()` et renvoie la première IPv4 non-internal. Elle ne tourne que côté serveur — le client la fetch en HTTP.

Utilisé à deux endroits :
- **Homepage** : encart « Continuer sur mobile »
- **`/payment`** méthode « Mobile » : même mécanisme, plus un paramètre `?initiator=<email>` pour vérifier que la même personne finalise sur son téléphone

---

## 10. Backend — Structure (résumé)

```
src/main/java/com/example/Parking/
├── ParkingApplication.java          ← @SpringBootApplication, point d'entrée
├── config/
│   ├── CorsConfig.java              ← CorsConfigurationSource bean (LAN pattern)
│   ├── WebSocketConfig.java         ← STOMP /ws, broker /topic, prefix /app
│   ├── PasswordConfig.java          ← BCryptPasswordEncoder bean
│   └── AdminSeeder.java             ← Crée admin@parking.com / admin123 au boot
├── security/
│   ├── SecurityConfig.java          ← Filter chain (JWT, CORS, OPTIONS permit)
│   ├── JwtService.java              ← generateToken(email, role), extractRole
│   ├── JwtFilter.java               ← Extrait le token de Authorization header
│   └── CustomUserDetailsService.java
├── controller/
│   ├── AuthController.java          ← /auth/login, /auth/register
│   ├── UserController.java          ← /user/profile, /user/parkings, /user/reserve
│   ├── PaymentController.java       ← /user/payment
│   ├── ParkingController.java       ← /admin/parkings CRUD
│   ├── ReservationController.java   ← /admin/reservations + PDF + QR backend
│   ├── AdminUserController.java     ← /admin/users (DTO sortie, pas l'entité)
│   ├── DashboardController.java     ← /admin/dashboard/stats
│   ├── PlaceController.java         ← /places/parking/{id}
│   └── IAController.java            ← intégration IA (caméras, optionnel)
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── ParkingService.java          ← delete @Transactional avec cascade reservations
│   ├── ReservationService.java      ← publie sur WebSocket au moment du save
│   ├── PlaceService.java            ← publie sur WebSocket sur updateStatus
│   ├── PaymentService.java
│   ├── PdfService.java              ← jPDF côté backend (reçus admin)
│   ├── QrCodeService.java           ← ZXing (QR pour reçus)
│   └── PlaceRealtimeService.java
├── realtime/
│   └── PlaceRealtimePublisher.java  ← Wrapper SimpMessagingTemplate
├── scheduler/
│   └── ReservationScheduler.java    ← @Scheduled toutes les 60s, libère places expirées
├── repository/                      ← Spring Data JPA
│   ├── UserRepository.java
│   ├── ParkingRepository.java
│   ├── PlaceRepository.java
│   └── ReservationRepository.java
├── entity/                          ← @Entity JPA (mappées sur les tables)
│   ├── User.java
│   ├── Parking.java                 ← lat/lng + @JsonIgnore sur places/reservations
│   ├── Place.java
│   ├── Reservation.java
│   ├── StatutPlace.java             ← LIBRE / OCCUPE / RESERVE
│   ├── StatutReservation.java       ← EN_ATTENTE / ACTIVE / TERMINEE / ANNULEE
│   └── MethodePaiement.java         ← CARTE / MOBILE / VIREMENT
└── dto/                             ← DTOs request/response (sans password etc.)
    ├── LoginRequest.java
    ├── RegisterRequest.java         ← regex téléphone marocain
    ├── AuthResponse.java            ← { token, role, email, prenom, nom }
    ├── UserResponse.java            ← User sans password
    ├── ReservationRequest.java
    ├── ReservationResponse.java
    └── PaymentRequest.java          ← { reservationId, methode }
```

---

## 11. Comment ajouter une nouvelle page ?

1. Créer `app/(user)/ma-page/page.tsx` avec `'use client'` si interactif
2. Ajouter le lien dans `components/layout/Navbar.tsx`
3. Mettre à jour `middleware.ts` matcher si la route doit être protégée
4. Pour appeler l'API : `import api from '@/lib/api'` puis `await api.get(...)`
5. Pour s'abonner au temps réel : `import { useLivePlaces } from '@/lib/hooks/useLivePlaces'`

---

## 12. Comment ajouter un nouveau topic WebSocket ?

**Backend :**
```java
@Service
@RequiredArgsConstructor
public class MonPublisher {
    private final SimpMessagingTemplate template;
    public void send(MonDto dto) {
        template.convertAndSend("/topic/mon-topic", dto);
    }
}
```

**Frontend :**
```ts
// lib/hooks/useMonTopic.ts
import { useEffect } from 'react';
import { subscribeTopic } from '@/lib/realtime';

export function useMonTopic(handler: (msg: MonDto) => void) {
  useEffect(() => subscribeTopic<MonDto>('/topic/mon-topic', handler), [handler]);
}
```

Et appeler `useMonTopic(stableHandler)` dans la page.

---

Pour toute question, contactez le développeur initial.
