import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { fromBackendRole, type BackendUser } from '@/lib/adapters';
import type { User, UserRole } from '@/types/user';

interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function saveSession(token: string, user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie('token', token, 86400);
  setCookie('role', user.role, 86400);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setCookie('token', '', 0);
  setCookie('role', '', 0);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): UserRole | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.role) return null;
    return fromBackendRole(decoded.role);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BackendAuthResponse {
  token: string;
  role?: string;
  email?: string;
  prenom?: string;
  nom?: string;
}

export async function login({ email, password }: LoginPayload): Promise<User> {
  const { data } = await api.post<BackendAuthResponse>('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);

  let user: User;
  if (data.role && data.email) {
    user = {
      id: 0,
      firstName: data.prenom || '',
      lastName: data.nom || '',
      email: data.email,
      phone: '',
      licensePlate: '',
      role: fromBackendRole(data.role),
      status: 'ACTIVE',
    };
    try {
      const profile = await api.get<BackendUser>('/user/profile');
      user = {
        id: profile.data.id,
        firstName: profile.data.prenom,
        lastName: profile.data.nom,
        email: profile.data.email,
        phone: profile.data.telephone,
        licensePlate: profile.data.immatriculation,
        role: fromBackendRole(profile.data.role),
        status: 'ACTIVE',
      };
    } catch {
      // role-based redirect still works with partial profile
    }
  } else {
    const profile = await api.get<BackendUser>('/user/profile');
    user = {
      id: profile.data.id,
      firstName: profile.data.prenom,
      lastName: profile.data.nom,
      email: profile.data.email,
      phone: profile.data.telephone,
      licensePlate: profile.data.immatriculation,
      role: fromBackendRole(profile.data.role),
      status: 'ACTIVE',
    };
  }

  saveSession(data.token, user);
  return user;
}
