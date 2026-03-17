import { create } from 'zustand';
import { sitesApi, SitePayload } from '@/services/api';

export type SiteMaterial = {
  id: number;
  factorCode: string;
  factorLabel: string;
  quantityKg: number;
  co2Kg: number;
};

export type Site = {
  id: number;
  name: string;
  description?: string;
  location?: string;
  totalAreaM2: number;
  parkingSpaces: number;
  annualEnergyKwh: number;
  employeeCount: number;
  constructionYear?: number | null;
  energyFactorCode: string;
  energyLabel?: string;
  co2Construction: number | null;
  co2Exploitation: number | null;
  co2Total: number | null;
  co2PerM2: number | null;
  co2PerEmployee: number | null;
  organizationName: string;
  materials: SiteMaterial[];
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
};

type SitesState = {
  sites: Site[];
  currentSite: Site | null;
  isLoading: boolean;
  error: string | null;
  fetchSites: () => Promise<void>;
  fetchSite: (id: number) => Promise<void>;
  createSite: (data: SitePayload) => Promise<Site>;
  updateSite: (id: number, data: SitePayload) => Promise<Site>;
  deleteSite: (id: number) => Promise<void>;
  clearError: () => void;
};

export const useSitesStore = create<SitesState>((set) => ({
  sites: [],
  currentSite: null,
  isLoading: false,
  error: null,

  fetchSites: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await sitesApi.list();
      set({ sites: data, isLoading: false });
    } catch {
      set({ error: 'Impossible de charger les sites', isLoading: false });
    }
  },

  fetchSite: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await sitesApi.getById(id);
      set({ currentSite: data, isLoading: false });
    } catch {
      set({ error: 'Site introuvable', isLoading: false });
    }
  },

  createSite: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await sitesApi.create(payload);
      set((state) => ({ sites: [data, ...state.sites], isLoading: false }));
      return data;
    } catch (err: any) {
      const message = err.response?.data?.error ?? 'Erreur lors de la création du site';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateSite: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await sitesApi.update(id, payload);
      set((state) => ({
        sites: state.sites.map((s) => (s.id === id ? data : s)),
        currentSite: state.currentSite?.id === id ? data : state.currentSite,
        isLoading: false,
      }));
      return data;
    } catch (err: any) {
      const message = err.response?.data?.error ?? 'Erreur lors de la mise à jour';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteSite: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await sitesApi.delete(id);
      set((state) => ({
        sites: state.sites.filter((s) => s.id !== id),
        currentSite: state.currentSite?.id === id ? null : state.currentSite,
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.error ?? 'Erreur lors de la suppression';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
