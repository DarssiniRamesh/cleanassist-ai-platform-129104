 // PUBLIC_INTERFACE
 /**
  * getApiBaseUrl
  * Returns the configured API base URL for the frontend.
  * Order:
  * - REACT_APP_BASE_URL
  * - REACT_APP_API_BASE_URL (legacy)
  * - http://localhost:3001 (default)
  */
 export function getApiBaseUrl() {
   const raw =
     (process.env.REACT_APP_BASE_URL && process.env.REACT_APP_BASE_URL.trim()) ||
     (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim()) ||
     'http://localhost:3001';
   const base = raw.endsWith('/') ? raw.slice(0, -1) : raw;
   if (process.env.NODE_ENV !== 'production') {
     // eslint-disable-next-line no-console
     console.debug('[api/client] API base URL:', base);
   }
   return base;
 }
