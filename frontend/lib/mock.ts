import type { Parking } from '@/types/parking';
import type { Reservation } from '@/types/reservation';
import type { User } from '@/types/user';

export const mockParkings: Parking[] = [
  {
    id: 1,
    name: 'Parking Centre-Ville',
    address: '12 Rue de la République, 75001 Paris',
    totalSpots: 80,
    availableSpots: 23,
    hourlyRate: 3.5,
    openTime: '06:00',
    closeTime: '23:00',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    id: 2,
    name: 'Parking Gare du Nord',
    address: '18 Rue de Dunkerque, 75010 Paris',
    totalSpots: 150,
    availableSpots: 4,
    hourlyRate: 4.2,
    openTime: '00:00',
    closeTime: '23:59',
    latitude: 48.8809,
    longitude: 2.3553,
  },
  {
    id: 3,
    name: 'Parking Bastille',
    address: 'Place de la Bastille, 75011 Paris',
    totalSpots: 120,
    availableSpots: 0,
    hourlyRate: 3.8,
    openTime: '07:00',
    closeTime: '22:00',
    latitude: 48.8532,
    longitude: 2.3691,
  },
  {
    id: 4,
    name: 'Parking Montparnasse',
    address: '17 Rue de l\'Arrivée, 75015 Paris',
    totalSpots: 200,
    availableSpots: 78,
    hourlyRate: 3.0,
    openTime: '06:00',
    closeTime: '23:00',
    latitude: 48.8421,
    longitude: 2.3219,
  },
  {
    id: 5,
    name: 'Parking La Défense',
    address: 'Esplanade de La Défense, 92800 Puteaux',
    totalSpots: 300,
    availableSpots: 142,
    hourlyRate: 2.8,
    openTime: '05:30',
    closeTime: '00:00',
    latitude: 48.8924,
    longitude: 2.2378,
  },
];

export const mockReservations: Reservation[] = [
  {
    id: 1001,
    userId: 1,
    userName: 'Marie Dubois',
    parkingId: 1,
    parkingName: 'Parking Centre-Ville',
    spotNumber: 'B12',
    startTime: '2026-05-12T10:00:00',
    endTime: '2026-05-12T14:00:00',
    duration: 4,
    totalAmount: 14.0,
    status: 'ACTIVE',
  },
  {
    id: 1002,
    userId: 1,
    userName: 'Marie Dubois',
    parkingId: 4,
    parkingName: 'Parking Montparnasse',
    spotNumber: 'A07',
    startTime: '2026-05-10T08:00:00',
    endTime: '2026-05-10T18:00:00',
    duration: 10,
    totalAmount: 30.0,
    status: 'COMPLETED',
  },
  {
    id: 1003,
    userId: 1,
    userName: 'Marie Dubois',
    parkingId: 2,
    parkingName: 'Parking Gare du Nord',
    spotNumber: 'C03',
    startTime: '2026-05-08T09:00:00',
    endTime: '2026-05-08T11:00:00',
    duration: 2,
    totalAmount: 8.4,
    status: 'CANCELLED',
  },
];

export const mockUsers: User[] = [
  { id: 1, firstName: 'Marie', lastName: 'Dubois', email: 'marie@example.com', phone: '06 12 34 56 78', licensePlate: 'AB-123-CD', role: 'USER', status: 'ACTIVE' },
  { id: 2, firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com', phone: '06 98 76 54 32', licensePlate: 'XY-456-ZW', role: 'USER', status: 'ACTIVE' },
  { id: 3, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie@example.com', phone: '06 55 44 33 22', licensePlate: 'EF-789-GH', role: 'ADMIN', status: 'ACTIVE' },
  { id: 4, firstName: 'Lucas', lastName: 'Petit', email: 'lucas@example.com', phone: '06 11 22 33 44', licensePlate: 'IJ-012-KL', role: 'USER', status: 'INACTIVE' },
];

export const mockStats = {
  totalParkings: mockParkings.length,
  activeReservations: 42,
  occupancyRate: 67,
  activeUsers: 318,
};

export const mockReservationTrend = [
  { day: 'Lun', count: 24 },
  { day: 'Mar', count: 31 },
  { day: 'Mer', count: 28 },
  { day: 'Jeu', count: 45 },
  { day: 'Ven', count: 52 },
  { day: 'Sam', count: 38 },
  { day: 'Dim', count: 22 },
];
