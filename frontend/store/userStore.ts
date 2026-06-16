import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Measurements {
  height_cm: number | null;
  chest_inches: number | null;
  waist_inches: number | null;
  hips_inches: number | null;
  shoulders_inches: number | null;
  shirt_size: string | null;
  pant_size: string | null;
  jacket_size: string | null;
  photo_url: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  mode: 'simple' | 'smart';
}

interface UserStore {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  measurements: Measurements | null;
  skinTone: string | null;
  colourPalette: string[];
  setUser: (user: User, token: string) => void;
  setMode: (mode: 'simple' | 'smart') => void;
  setMeasurements: (m: Measurements) => void;
  setSkinTone: (tone: string, palette: string[]) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      measurements: null,
      skinTone: null,
      colourPalette: [],

      setUser: (user, token) =>
        set({ user, token, isLoggedIn: true }),

      setMode: (mode) =>
        set((state) =>
          state.user ? { user: { ...state.user, mode } } : {}
        ),

      setMeasurements: (measurements) => set({ measurements }),

      setSkinTone: (skinTone, colourPalette) =>
        set({ skinTone, colourPalette }),

      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          measurements: null,
          skinTone: null,
          colourPalette: [],
        }),
    }),
    { name: 'styleai-user' }
  )
);
