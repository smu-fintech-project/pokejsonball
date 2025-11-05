/**
 * Proxy external images through our backend to avoid CORS issues
 * @param {string} imageUrl - The original image URL
 * @returns {string} - Proxied URL or original if local
 */
import { API_BASE } from './env';

export function getProxiedImageUrl(imageUrl) {
  if (!imageUrl) return '';
  
  // If it's already a local/proxied URL, return as-is
  if (imageUrl.startsWith('/') || imageUrl.includes('localhost')) {
    return imageUrl;
  }
  
  // Proxy external images through our backend
  const apiBase = API_BASE;
  return `${apiBase}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}
