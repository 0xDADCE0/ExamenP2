// src/api/notifications.js
import { apiFetch } from './client';

export function fetchNotifications(token) {
  return apiFetch('/notifications?status=unread&limit=50&offset=0', {
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
