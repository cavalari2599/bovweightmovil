// Configuracion central de endpoints (G35: datos configurables en nivel superior).
// Un solo lugar define el host; el API y el storage se derivan de el (G5: sin duplicar host).
// Sobreescribible por entorno con VITE_API_HOST.
export const API_HOST = import.meta.env.VITE_API_HOST || 'http://127.0.0.1:8000'
export const API_BASE_URL = `${API_HOST}/api`
export const STORAGE_BASE_URL = `${API_HOST}/storage`
