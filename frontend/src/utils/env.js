const DEFAULT_LOCAL_BASE = 'http://localhost:3001';
const DEFAULT_REMOTE_BASE = 'https://pokejsonball.onrender.com';

const stripTrailingSlash = (value) =>
  value.endsWith('/') ? value.replace(/\/+$/, '') : value;

const resolveBase = (explicitValue) => {
  const trimmed = explicitValue?.trim();
  if (trimmed) {
    return stripTrailingSlash(trimmed);
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return DEFAULT_REMOTE_BASE;
  }

  return DEFAULT_LOCAL_BASE;
};

export const API_BASE = resolveBase(import.meta.env.VITE_API_BASE);
export const API_URL = resolveBase(import.meta.env.VITE_API_URL) || API_BASE;
