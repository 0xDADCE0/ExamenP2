// src/api/client.js
const BASE_URL = 'http://10.211.55.27:3000/api';

export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Error HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}
