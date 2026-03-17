import { create } from 'zustand';
import { authApi, clearTokens, storeTokens } from '@/services/api';

export type AuthUser = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  organizationId: number | null;
  organizationName: string | null;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      await storeTokens(data.accessToken, data.refreshToken);
      set({
        user: {
          userId: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
        },
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.error ?? 'Erreur de connexion';
      set({ error: message, isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await authApi.register(data);
      await storeTokens(res.accessToken, res.refreshToken);
      set({
        user: {
          userId: res.userId,
          email: res.email,
          firstName: res.firstName,
          lastName: res.lastName,
          role: res.role,
          organizationId: res.organizationId,
          organizationName: res.organizationName,
        },
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.error ?? "Erreur lors de l'inscription";
      set({ error: message, isLoading: false });
    }
  },

  logout: async () => {
    await clearTokens();
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
