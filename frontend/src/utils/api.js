/**
 * API Client for Pokemon Trading Card Marketplace
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Create axios instance with auth headers
 */
const createApiClient = () => {
  const token = getAuthToken();
  
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

/**
 * Get all configured cert numbers
 * 
 * @returns {Promise<string[]>}
 */
export async function getAllCertNumbers() {
  const client = createApiClient();
  
  try {
    const response = await client.get('/api/certs/all');
    return response.data.cert_numbers || [];
  } catch (error) {
    console.error('getAllCertNumbers error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch cert numbers');
  }
}

/**
 * Get PSA certs by IDs
 * 
 * @param {string[]} ids - Array of PSA cert numbers
 * @returns {Promise<{ certs: Object[], errors?: Object[] }>}
 */
export async function getCerts(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('ids must be a non-empty array');
  }

  const client = createApiClient();
  const idsString = ids.join(',');
  
  try {
    const response = await client.get(`/api/certs?ids=${idsString}`);
    return response.data;
  } catch (error) {
    console.error('getCerts error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch certs');
  }
}

/**
 * Get all cards
 * 
 * @param {Object} params - Query parameters (limit, offset, grade, set)
 * @returns {Promise<Object>}
 */
export async function getAllCards(params = {}) {
  const client = createApiClient();
  
  try {
    const response = await client.get('/api/cards', { params });
    return response.data;
  } catch (error) {
    console.error('getAllCards error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch cards');
  }
}

/**
 * Get card by cert number
 * 
 * @param {string} certNumber - PSA cert number
 * @returns {Promise<Object>}
 */
export async function getCardByCert(certNumber) {
  const client = createApiClient();
  
  try {
    const response = await client.get(`/api/v2/cards/${certNumber}`);
    return response.data;
  } catch (error) {
    console.error('getCardByCert error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch card');
  }
}

/**
 * Get batch cards
 * 
 * @param {string[]} certNumbers - Array of cert numbers
 * @returns {Promise<Object>}
 */
export async function getBatchCards(certNumbers) {
  const client = createApiClient();
  
  try {
    const response = await client.post('/api/v2/cards/batch', { certNumbers });
    return response.data;
  } catch (error) {
    console.error('getBatchCards error:', error);
    throw new Error(error.response?.data?.message || 'Failed to batch fetch cards');
  }
}

/**
 * Login user
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export async function login(email, password) {
  const client = axios.create({ baseURL: API_BASE });
  
  try {
    const response = await client.post('/api/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

/**
 * Register user
 * 
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>}
 */
export async function register(userData) {
  const client = axios.create({ baseURL: API_BASE });
  
  try {
    const response = await client.post('/api/auth/register', userData);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('register error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

/**
 * Check if user is authenticated
 * 
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

export default {
  getAllCertNumbers,
  getCerts,
  getAllCards,
  getCardByCert,
  getBatchCards,
  login,
  register,
  logout,
  isAuthenticated
};

