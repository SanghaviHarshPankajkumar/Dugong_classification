import { create } from "zustand";
import { persist } from "zustand/middleware";

const ONE_HOUR = 60 * 60 * 1000;

const customStorage: StateStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      const { value, timestamp } = JSON.parse(str);
      if (Date.now() - timestamp > ONE_HOUR) {
        localStorage.removeItem(name);
        return null;
      }
      return JSON.stringify(value); // must return serialized value
    } catch {
      return null;
    }
  },

  setItem: (name, value) => {
    const payload = {
      value: JSON.parse(value),
      timestamp: Date.now(),
    };
    localStorage.setItem(name, JSON.stringify(payload));
  },

  removeItem: (name) => localStorage.removeItem(name),
};

type AuthState = {
  token: string | null;
  user: {
    id?: string;
    email?: string;
  } | null;
  preferences: {
    language: string;
    notifications: boolean;
  };
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  setUser: (user: AuthState["user"]) => void;
};

export const useAuthStore = create<
  AuthState,
  [["zustand/persist", Partial<AuthState>]]
>(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      preferences: {
        theme: "system",
        language: "en",
        notifications: true,
      },
      isAuthenticated: false,

      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      clearToken: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      setUser: (user) => set({ user }),

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        })),
    }),
    {
      name: "auth-storage",
      storage: customStorage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        preferences: state.preferences,
      }),
    }
  )
);
