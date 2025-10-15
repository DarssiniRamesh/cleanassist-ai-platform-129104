 // PUBLIC_INTERFACE
 /**
  * getApiBaseUrl
  * Returns the configured API base URL for the frontend.
  *
  * Priority order (left to right):
  * - REACT_APP_BACKEND_URL (explicit backend URL; preferred to ensure correct port like 3001)
  * - REACT_APP_BASE_URL (alternate preferred)
  * - REACT_APP_API_BASE_URL (legacy)
  * - window._BACKEND_URL (runtime-injected override, no trailing slash)
  * - window.location.origin when explicitly enabled via:
  *     - REACT_APP_USE_SAME_ORIGIN=true
  *     - or window.__USE_SAME_ORIGIN_FOR_API__ === true
  * - http://localhost:3001 (sensible local default)
  *
  * Notes:
  * - Do not include a trailing slash in values; this function strips it if present.
  * - Use this helper for all API calls to avoid posting to the frontend origin (e.g., port 3000).
  */
 export function getApiBaseUrl() {
   // Environment variables
   const envBackend =
     (process.env.REACT_APP_BACKEND_URL && process.env.REACT_APP_BACKEND_URL.trim()) || '';
   const envBase =
     (process.env.REACT_APP_BASE_URL && process.env.REACT_APP_BASE_URL.trim()) || '';
   const envLegacy =
     (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim()) || '';
 
   // Runtime/window based overrides (if available)
   let runtimeBackend = '';
   try {
     if (typeof window !== 'undefined') {
       if (window._BACKEND_URL && typeof window._BACKEND_URL === 'string') {
         runtimeBackend = window._BACKEND_URL.trim();
       } else if (
         (process.env.REACT_APP_USE_SAME_ORIGIN === 'true') ||
         (window.__USE_SAME_ORIGIN_FOR_API__ === true)
       ) {
         runtimeBackend = window.location.origin;
       }
     }
   } catch {
     // no-op: window may be undefined in some build/test contexts
   }
 
   const raw =
     (envBackend && envBackend) ||
     (envBase && envBase) ||
     (envLegacy && envLegacy) ||
     (runtimeBackend && runtimeBackend) ||
     'http://localhost:3001';
 
   const base = raw.endsWith('/') ? raw.slice(0, -1) : raw;
   if (process.env.NODE_ENV !== 'production') {
     // eslint-disable-next-line no-console
     console.debug('[api/client] API base URL:', base);
   }
   return base;
 }
