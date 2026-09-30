export interface Parking {
  id: number;
  name: string;
  address: string;
  totalSpots: number;
  availableSpots: number;
  hourlyRate: number;
  openTime: string;
  closeTime: string;
  latitude: number;
  longitude: number;
}
