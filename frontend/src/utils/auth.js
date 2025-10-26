/**
 * Authentication utility functions
 * Provides easy access to user authentication data stored in localStorage
 */

/**
 * Get the current logged-in user's information
 * @returns {Object} User information object
 */
export function getCurrentUser() {
  return {
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    email: localStorage.getItem('userEmail') || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  };
}

/**
 * Get just the user ID (useful for Socket.IO connections)
 * @returns {string|null} The user's ID or null if not logged in
 */
export function getUserId() {
  return localStorage.getItem('userId');
}

/**
 * Get the username
 * @returns {string|null} The username or null if not logged in
 */
export function getUsername() {
  return localStorage.getItem('username');
}

/**
 * Get the user's email
 * @returns {string|null} The email or null if not logged in
 */
export function getUserEmail() {
  return localStorage.getItem('userEmail');
}

/**
 * Get the auth token
 * @returns {string|null} The JWT token or null if not logged in
 */
export function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Clear all authentication data (logout)
 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('userEmail');
}

