import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

export type TemplateMaterial = {
  emissionFactorCode: string;
  factorLabel: string;
  quantity: string;   // valeur saisie
  unit: 'kg' | 't';
};

export type SiteTemplate = {
  id: string;               // uuid local
  name: string;             // nom du modèle (ex: "Bureau Standard")
  energyFactorCode: string;
  materials: TemplateMaterial[];
  createdAt: string;
};

type TemplatesState = {
  templates: SiteTemplate[];
  saveTemplate: (template: Omit<SiteTemplate, 'id' | 'createdAt'>) => void;
  deleteTemplate: (id: string) => void;
};

/** Stockage asynchrone multiplateforme */
const storage = Platform.OS === 'web'
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => {
      // expo-secure-store n'a pas d'API synchrone compatible — on utilise AsyncStorage si disponible
      try {
        const AS = require('@react-native-async-storage/async-storage').default;
        return AS;
      } catch {
        return localStorage;
      }
    });

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: [],

      saveTemplate: (template) =>
        set((state) => ({
          templates: [
            {
              ...template,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
            ...state.templates,
          ],
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'carbon-calculator-templates',
      storage,
    }
  )
);
