// src/api/auth.js
import { apiFetch } from './client';

export function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile(token) {
  return apiFetch('/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
