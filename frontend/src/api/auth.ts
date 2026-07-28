import { apiFetch } from './client';
import type { User } from '../types';

export function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}

export function login(email: string, password: string): Promise<User> {
  return apiFetch<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string): Promise<User> {
  return apiFetch<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/auth/logout', { method: 'POST' });
}

export function deleteAccount(): Promise<void> {
  return apiFetch<void>('/api/auth/me', { method: 'DELETE' });
}
