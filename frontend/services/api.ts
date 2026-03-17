import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getApiBase = () => {
  // Variable d'environnement prioritaire (définie dans .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback local selon la plateforme
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api'; // Émulateur Android
  }
  return 'http://localhost:8080/api'; // iOS simulateur & web
};

const API_BASE = getApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach access token
api.interceptors.request.use(async (config) => {
  let token: string | null = null;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('accessToken');
  } else {
    token = await SecureStore.getItemAsync('accessToken');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token storage helpers
export const storeTokens = async (accessToken: string, refreshToken: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  }
};

export const clearTokens = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } else {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

// API calls
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organizationName?: string;
    organizationId?: number;
  }) => api.post('/auth/register', data),
};

export const sitesApi = {
  list: () => api.get('/sites'),
  getById: (id: number) => api.get(`/sites/${id}`),
  create: (data: SitePayload) => api.post('/sites', data),
  update: (id: number, data: SitePayload) => api.put(`/sites/${id}`, data),
  delete: (id: number) => api.delete(`/sites/${id}`),
  snapshots: (id: number) => api.get(`/sites/${id}/snapshots`),
};

export const emissionFactorsApi = {
  list: () => api.get('/emission-factors'),
};

export type EmissionFactor = {
  id: number;
  code: string;
  label: string;
  category: 'MATERIAL' | 'ENERGY';
  kgCo2ePerUnit: number;
  unit: string;
  source: string;
  scope?: 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';
};

export const SCOPE_LABELS: Record<string, string> = {
  SCOPE_1: 'Scope 1',
  SCOPE_2: 'Scope 2',
  SCOPE_3: 'Scope 3',
};

export const SCOPE_COLORS: Record<string, string> = {
  SCOPE_1: '#DC3545',
  SCOPE_2: '#FFC107',
  SCOPE_3: '#0070AD',
};

export type SiteSnapshot = {
  id: number;
  snapshotDate: string;
  co2Construction: number | null;
  co2Exploitation: number | null;
  co2Total: number | null;
  co2PerM2: number | null;
  co2PerEmployee: number | null;
  annualEnergyKwh: number | null;
  energyFactorCode: string | null;
  note: string | null;
};

export type SitePayload = {
  name: string;
  description?: string;
  location?: string;
  constructionYear?: number | null;
  totalAreaM2: number;
  parkingSpaces: number;
  annualEnergyKwh: number;
  employeeCount: number;
  energyFactorCode: string;
  materials: { emissionFactorCode: string; quantityKg: number }[];
};
