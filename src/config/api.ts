// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  balance: {
    list: '/balance',
    create: '/balance',
    update: (id: string) => `/balance/${id}`,
    delete: (id: string) => `/balance/${id}`,
  },
  tax: {
    list: '/tax',
    create: '/tax',
    update: (id: string) => `/tax/${id}`,
    delete: (id: string) => `/tax/${id}`,
  },
  users: {
    list: '/users',
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  reports: {
    generate: '/reports',
  },
};