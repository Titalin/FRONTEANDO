// src/services/api.js
import axios from 'axios';

const PROD_FALLBACK = 'https://backend-bodegix.onrender.com';

const isBrowser = typeof window !== 'undefined';
const origin = isBrowser ? window.location.origin : '';
const isLocalhost =
  isBrowser && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

// 1) Prioriza la env; si no hay, cae a fallback según entorno
let raw = (process.env.REACT_APP_API_URL || '').trim();
if (!raw) raw = isLocalhost ? 'http://localhost:5000' : PROD_FALLBACK;

// 2) Normaliza: quita slashes finales y asegura /api
const normalized = raw.replace(/\/+$/, '');
const baseURL = normalized.endsWith('/api') ? normalized : `${normalized}/api`;

// 3) Guardia: en producción, evitar usar el mismo origen del front (devolvería HTML)
if (!isLocalhost && isBrowser && baseURL.startsWith(origin)) {
  // No lanzamos error para no romper la app, pero avisamos en consola
  console.error(
    `[API] Estás apuntando al mismo origen del front (${origin}). ` +
    `Eso suele devolver HTML y romper JSON. Ajusta REACT_APP_API_URL al backend.`
  );
}

// 4) Instancia de axios
const api = axios.create({
  baseURL,
  // timeout: 15000, // opcional
});

// 5) Token en headers
api.interceptors.request.use((config) => {
  try {
    const token = isBrowser ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

console.log('[API] baseURL =>', baseURL);
export default api;
