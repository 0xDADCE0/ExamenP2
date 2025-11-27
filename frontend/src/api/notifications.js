// src/api/notifications.js
import { apiFetch } from './client';

export function fetchNotifications(token, status = 'all') {
  return apiFetch(`/notifications?status=${status}&limit=100&offset=0`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function markNotificationRead(token, userNotificationId) {
  return apiFetch(`/notifications/${userNotificationId}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}