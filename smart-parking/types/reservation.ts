export type ReservationStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  parkingId: number;
  parkingName: string;
  spotNumber: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: ReservationStatus;
}
