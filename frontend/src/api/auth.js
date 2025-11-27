// src/api/auth.js
import { apiFetch } from './client';

export function register(email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

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

export function updateProfile(token, data) {
  return apiFetch('/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}
