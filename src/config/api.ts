/**
 * API Configuration
 * Uses environment variable VITE_API_URL
 * Fallback to localhost for development
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/api/auth/login`,
    signup: `${API_URL}/api/auth/signup`,
    logout: `${API_URL}/api/auth/logout`,
  },
  leads: {
    list: `${API_URL}/api/leads`,
    create: `${API_URL}/api/leads`,
  },
  conversations: {
    list: `${API_URL}/api/conversations`,
    get: (id: string) => `${API_URL}/api/conversations/${id}`,
  },
  telegram: {
    webhook: `${API_URL}/api/telegram/webhook`,
  },
}

console.log(`🌐 API URL configured: ${API_URL}`)
