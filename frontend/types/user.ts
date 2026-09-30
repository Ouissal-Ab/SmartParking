export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licensePlate: string;
  role: UserRole;
  status: UserStatus;
}
