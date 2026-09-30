import type { Parking } from '@/types/parking';
import type { Reservation, ReservationStatus } from '@/types/reservation';
import type { User, UserRole } from '@/types/user';

export interface BackendParking {
  id: number;
  nom: string;
  adresse: string;
  nombreDePlaces: number;
  tarifParHeure: number;
  heureOuverture: string;
  heureFermeture: string;
  surveilleParIA?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BackendPlace {
  id: number;
  numero: string;
  statut: 'LIBRE' | 'OCCUPE' | 'RESERVE';
}

export interface BackendReservation {
  id: number;
  code: string;
  dateReservation: string | null;
  heureDebut: string;
  heureFin: string;
  montantTotal: number;
  statut: 'EN_ATTENTE' | 'ACTIVE' | 'TERMINEE' | 'ANNULEE';
  methodePaiement?: 'CARTE' | 'MOBILE' | 'VIREMENT' | null;
  user?: BackendUser;
  parking?: BackendParking;
  place?: BackendPlace;
}

export interface BackendUser {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  immatriculation: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | string;
}

const MARRAKECH: [number, number] = [31.6295, -7.9811];

function fallbackCoords(id: number): [number, number] {
  const seed = (id * 9301 + 49297) % 233280;
  const rand = seed / 233280;
  return [MARRAKECH[0] + (rand - 0.5) * 0.06, MARRAKECH[1] + (rand - 0.3) * 0.06];
}

export function toParking(b: BackendParking, availableSpots = 0): Parking {
  const time = (t: string) => (t?.length >= 5 ? t.slice(0, 5) : t);
  const [lat, lng] =
    b.latitude != null && b.longitude != null
      ? [b.latitude, b.longitude]
      : fallbackCoords(b.id);
  return {
    id: b.id,
    name: b.nom,
    address: b.adresse,
    totalSpots: b.nombreDePlaces,
    availableSpots,
    hourlyRate: b.tarifParHeure,
    openTime: time(b.heureOuverture),
    closeTime: time(b.heureFermeture),
    latitude: lat,
    longitude: lng,
  };
}

const resStatusMap: Record<BackendReservation['statut'], ReservationStatus> = {
  EN_ATTENTE: 'ACTIVE',
  ACTIVE: 'ACTIVE',
  TERMINEE: 'COMPLETED',
  ANNULEE: 'CANCELLED',
};

export function toReservation(b: BackendReservation): Reservation {
  const date = b.dateReservation || new Date().toISOString().split('T')[0];
  const start = `${date}T${b.heureDebut}`;
  const end = `${date}T${b.heureFin}`;
  const [sh, sm] = (b.heureDebut || '00:00').split(':').map(Number);
  const [eh, em] = (b.heureFin || '00:00').split(':').map(Number);
  const durationMinutes = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
    const duration = Math.round((durationMinutes / 60) * 100) / 100;
  return {
    id: b.id,
    userId: b.user?.id ?? 0,
    userName: b.user ? `${b.user.prenom} ${b.user.nom}` : '—',
    parkingId: b.parking?.id ?? 0,
    parkingName: b.parking?.nom ?? '—',
    spotNumber: b.place?.numero ?? '—',
    startTime: start,
    endTime: end,
    duration,
    totalAmount: b.montantTotal,
    status: resStatusMap[b.statut] ?? 'ACTIVE',
  };
}

export function toUser(b: BackendUser): User {
  const role: UserRole = b.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
  return {
    id: b.id,
    firstName: b.prenom,
    lastName: b.nom,
    email: b.email,
    phone: b.telephone,
    licensePlate: b.immatriculation,
    role,
    status: 'ACTIVE',
  };
}

export function toBackendRole(role: UserRole): 'ROLE_ADMIN' | 'ROLE_USER' {
  return role === 'ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER';
}

export function fromBackendRole(role: string): UserRole {
  return role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
}

export interface ParkingCreatePayload {
  nom: string;
  adresse: string;
  nombreDePlaces: number;
  tarifParHeure: number;
  heureOuverture: string;
  heureFermeture: string;
  latitude?: number;
  longitude?: number;
  surveilleParIA?: boolean;
}

export function toBackendParking(p: {
  name: string;
  address: string;
  totalSpots: number;
  hourlyRate: number;
  openTime: string;
  closeTime: string;
  latitude?: number;
  longitude?: number;
}): ParkingCreatePayload {
  const t = (s: string) => (s.length === 5 ? `${s}:00` : s);
  return {
    nom: p.name,
    adresse: p.address,
    nombreDePlaces: p.totalSpots,
    tarifParHeure: p.hourlyRate,
    heureOuverture: t(p.openTime),
    heureFermeture: t(p.closeTime),
    latitude: p.latitude,
    longitude: p.longitude,
    surveilleParIA: false,
  };
}
