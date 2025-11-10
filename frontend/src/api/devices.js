// src/api/devices.js
import { apiFetch } from './client';

export function subscribeToDevice(token, deviceCode) {
  return apiFetch(`/devices/${deviceCode}/subscribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
