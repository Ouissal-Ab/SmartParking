# 🚗 Smart Parking — Guide d'installation

Application complète de réservation de places de parking : **backend Spring Boot 3 (Java 21) + PostgreSQL** et **frontend Next.js 14 (TypeScript, TailwindCSS, glassmorphism)** avec mises à jour en direct via WebSocket.

---

## 1. Pré-requis

| Outil | Version minimale | Vérification |
|---|---|---|
| Java JDK | **21** | `java -version` |
| Node.js | **18.18+** (idéalement 20 LTS ou plus) | `node -v` |
| npm | **9+** | `npm -v` |
| PostgreSQL | **14+** | `psql --version` |
| Git (optionnel) | — | `git --version` |

> ℹ Le projet contient un **Maven Wrapper** (`mvnw`) — pas besoin d'installer Maven séparément.

### Installer rapidement les outils manquants

**macOS (Homebrew) :**
```bash
brew install openjdk@21 node postgresql@17
brew services start postgresql@17
```

> Sur macOS, ajoutez Java au PATH si nécessaire :
> ```bash
> export JAVA_HOME=/opt/homebrew/opt/openjdk@21
> export PATH=$JAVA_HOME/bin:$PATH
> ```

**Windows :** téléchargez les installeurs depuis [adoptium.net](https://adoptium.net) (Java 21), [nodejs.org](https://nodejs.org) et [postgresql.org](https://www.postgresql.org/download/windows/).

**Linux (Debian/Ubuntu) :**
```bash
sudo apt update
sudo apt install -y openjdk-21-jdk nodejs npm postgresql
```

---

## 2. Récupération du projet

Si vous avez reçu une archive `.zip` :
```bash
unzip Parking.zip
cd Parking
```

La structure attendue :
```
Parking/
├── pom.xml                 # backend Maven
├── mvnw / mvnw.cmd
├── smartparking.sql        # dump de base de données
├── src/main/java/...       # code backend
├── smart-parking/          # frontend Next.js
│   ├── package.json
│   ├── app/
│   └── components/
└── INSTALLATION.md         # ce fichier
```

---

## 3. Mise en place de la base de données

### 3.1 — Créer le rôle et la base

Connectez-vous à PostgreSQL en super-utilisateur (sur macOS Homebrew, votre utilisateur Unix est super-user par défaut) :

```bash
psql -d postgres
```

Puis exécutez :

```sql
CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
CREATE DATABASE smartparking OWNER postgres;
\q
```

> ⚠ Si le rôle `postgres` existe déjà, sautez la première ligne. Si vous préférez un autre mot de passe, notez-le pour l'étape 4.

### 3.2 — Charger le dump SQL

```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d smartparking -f smartparking.sql
```

Vérification :
```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d smartparking \
  -c "SELECT COUNT(*) AS users FROM users; SELECT COUNT(*) AS parkings FROM parkings;"
```
Vous devez obtenir 5 utilisateurs et 5 parkings.

---

## 4. Backend Spring Boot

### 4.1 — Variables d'environnement

Le backend lit le mot de passe de la base depuis la variable `DB_PASSWORD` (voir `src/main/resources/application.properties`).

**macOS / Linux :**
```bash
export DB_PASSWORD=postgres
```

**Windows PowerShell :**
```powershell
$env:DB_PASSWORD = "postgres"
```

### 4.2 — Lancer le backend

Depuis le dossier racine `Parking/` :

**macOS / Linux :**
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

**Windows :**
```powershell
.\mvnw.cmd spring-boot:run
```

Vous devez voir dans la console :
```
Tomcat started on port 8080 (http) with context path '/'
Started ParkingApplication in 3.5 seconds
```

L'API est joignable sur **http://localhost:8080**.

Test rapide :
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@parking.com","password":"admin123"}'
```

---

## 5. Frontend Next.js

### 5.1 — Installer les dépendances

```bash
cd smart-parking
npm install
```

### 5.2 — Configurer l'URL de l'API

Un fichier `.env.local` est fourni avec :
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> Pas besoin de modifier en local. Quand le frontend est servi depuis une IP LAN (ex. `192.168.1.42:3001`), il appelle automatiquement la même IP sur le port 8080 — utile pour tester sur mobile.

### 5.3 — Lancer le frontend

```bash
npm run dev
```

Vous verrez :
```
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in 1.7s
```

Ouvrez **http://localhost:3000** dans votre navigateur.

> Si le port 3000 est occupé, Next.js basculera automatiquement sur 3001, 3002, etc.

---

## 6. Comptes par défaut

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@parking.com` | `admin123` |
| **Utilisateur de test** *(à créer via la page /register)* | — | — |

> Les utilisateurs du dump SQL (Yousra, Hatim, Ouissal, Hiba) ont des hashs de mots de passe d'origine inconnue. Créez votre propre compte depuis `/register`.

---

## 7. Tester sur téléphone mobile (même Wi-Fi)

1. Assurez-vous que le PC et le téléphone sont sur le **même réseau Wi-Fi**.
2. Récupérez l'IP locale du PC :
   - **macOS** : `ipconfig getifaddr en0`
   - **Windows** : `ipconfig` (cherchez « IPv4 »)
   - **Linux** : `hostname -I`
3. Sur le téléphone, ouvrez **`http://<IP>:3000`** (ou le port indiqué par Next.js).
4. La page d'accueil affiche un QR code en bas — vous pouvez aussi scanner ce QR pour ouvrir directement le site sur mobile.

> Le QR code de paiement (méthode « Mobile ») fonctionne sur le même principe : il génère une URL avec l'IP LAN du PC.

---

## 8. Build production (optionnel)

### Backend
```bash
./mvnw clean package
java -jar target/smart-parking-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd smart-parking
npm run build
npm run start
```

---

## 9. Dépannage

| Symptôme | Solution |
|---|---|
| `Unable to locate a Java Runtime` | Java 21 n'est pas dans le PATH. Réinstallez et exportez `JAVA_HOME`. |
| `connection refused` sur `localhost:5432` | PostgreSQL n'est pas démarré : `brew services start postgresql@17`. |
| `role "postgres" does not exist` | Créez le rôle (voir §3.1). |
| `Port 8080 was already in use` | Un ancien backend tourne. `lsof -i :8080` puis `kill -9 <PID>`. |
| `Port 3000 in use` | Next.js choisit automatiquement le port suivant. Pas bloquant. |
| Pas de données dans le tableau de bord admin | Reconnectez-vous (cookies/JWT expirés) et vérifiez que le backend est démarré. |
| Mobile ne peut pas se connecter | Vérifiez que le pare-feu autorise les ports 3000 et 8080 sur le réseau local. |
| `EADDRINUSE` sur 8080 | Voir « Port 8080 was already in use ». |
| Pas de carte affichée sur `/dashboard` | Vérifiez la console pour des erreurs Leaflet. Les anciens parkings sans latitude utilisent un fallback Marrakech automatiquement. |

---

## 10. Architecture

**Backend (Spring Boot 3.3 + Java 21)**
- API REST sécurisée par JWT (claim `role` inclus)
- WebSocket STOMP sur `/ws` pour la disponibilité en direct des places
- CORS ouvert pour le développement local (toutes IPs LAN autorisées)
- JPA / Hibernate vers PostgreSQL

**Frontend (Next.js 14 App Router)**
- React 18 + TypeScript strict
- TailwindCSS avec design system or / navy / pearl + glassmorphism
- `react-hook-form` + `zod` pour les formulaires
- `axios` vers l'API, `@stomp/stompjs` + `sockjs-client` pour le temps réel
- `react-leaflet` pour la carte interactive
- `recharts` pour les graphiques du dashboard admin
- `qrcode.react` pour les QR codes (paiement mobile + handoff homepage)
- `jspdf` pour la génération de reçus PDF côté client

---

## 11. Routes principales

| Route | Rôle | Description |
|---|---|---|
| `/` | Public | Page d'accueil + QR de handoff mobile |
| `/login`, `/register` | Public | Authentification |
| `/dashboard` | Utilisateur | Carte interactive + liste des parkings en temps réel |
| `/reserve/[id]` | Utilisateur | Réservation en 3 étapes |
| `/payment` | Utilisateur | Paiement (carte, mobile QR, virement, Apple Pay simulé) |
| `/confirmation` | Utilisateur | Confirmation + reçu PDF |
| `/reservations` | Utilisateur | Historique des réservations |
| `/admin` | Administrateur | Tableau de bord + KPIs |
| `/admin/parkings` | Administrateur | CRUD des parkings |
| `/admin/reservations` | Administrateur | Historique complet + filtres |
| `/admin/users` | Administrateur | Gestion des comptes |

---

## 12. Aller plus loin

Le fichier **`ARCHITECTURE.md`** (à la racine) explique en détail :
- l'arborescence du frontend, fichier par fichier
- la couche d'adaptation backend ↔ frontend
- l'authentification et le middleware Edge
- le **flux WebSocket complet** (STOMP, topics, publishers backend, hooks React)
- le design system
- la génération du QR de handoff mobile
- la structure du backend Spring Boot
- comment ajouter une page ou un nouveau topic temps réel

Lisez-le après avoir lancé l'app pour comprendre comment tout est branché.

---

Bon développement&nbsp;! 🚀
