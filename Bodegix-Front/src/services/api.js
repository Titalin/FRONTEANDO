// src/services/api.js
import axios from 'axios';

const DEFAULT_PROD = 'https://backend-bodegix.onrender.com';

const isBrowser = typeof window !== 'undefined';
const origin = isBrowser ? window.location.origin : '';
const isLocal =
  isBrowser && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

// 1) Tomar URL del backend desde env (CRA o Next) o caer a defaults
let raw =
  (process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();

if (!raw) raw = isLocal ? 'http://localhost:5000' : DEFAULT_PROD;

// 2) Normalizar: quitar slashes finales y asegurar que termine en /api
raw = raw.replace(/\/+$/, '');
const baseURL = /\/api(?:\/|$)$/i.test(raw) ? raw : `${raw}/api`;

// 3) Aviso: si baseURL coincide con el origen del front, vendrá HTML (mal)
if (!isLocal && isBrowser && baseURL.startsWith(origin)) {
  console.warn(
    `[API] baseURL (${baseURL}) coincide con el origen del front (${origin}). ` +
      `Eso suele devolver HTML y romper JSON. Configura REACT_APP_API_URL con el dominio del backend (p.ej. ${DEFAULT_PROD}).`
  );
}

// 4) Instancia de axios
const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
  // timeout: 15000, // opcional
});

// 5) Adjuntar token automáticamente
api.interceptors.request.use((config) => {
  try {
    const token = isBrowser ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// 6) Log útil si el backend devuelve HTML u otra cosa distinta a JSON
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const ct = err?.response?.headers?.['content-type'] || '';
    if (!ct.includes('application/json')) {
      const body =
        typeof err?.response?.data === 'string'
          ? err.response.data.slice(0, 200)
          : err?.response?.data;
      console.error('[API] Respuesta no JSON', {
        url: (err?.config?.baseURL || '') + (err?.config?.url || ''),
        status: err?.response?.status,
        contentType: ct,
        body,
      });
    }
    return Promise.reject(err);
  }
);

if (isBrowser) {
  console.log('[API] baseURL =>', baseURL);
  // Exponer para depuración en consola del navegador (opcional)
  window.api = api;
}

export default api;
export const API_BASE = baseURL;
