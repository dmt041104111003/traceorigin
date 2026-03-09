import { getAuthToken } from '../lib/account';

export function requireAuthToken(): string {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session expired. Please log in again.');
  }
  return token;
}

