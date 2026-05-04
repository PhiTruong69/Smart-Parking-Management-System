/**
 * apiFetch — wrapper tự động gắn JWT Bearer token vào mọi request
 *
 * Cách dùng:
 *   import { apiFetch } from '../lib/apiFetch';
 *   const res = await apiFetch('/api/parking/zones');
 */
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const raw = localStorage.getItem('spms-auth');
  const token: string | null = raw ? JSON.parse(raw)?.token ?? null : null;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Cho phép override headers từ caller (ví dụ multipart)
      ...(options.headers || {}),
    },
  });
}
