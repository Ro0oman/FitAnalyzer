import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Athlete {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  profile: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  athlete: Athlete | null;
  setAuth: (data: { accessToken: string; refreshToken: string; expiresAt: number; athlete: Athlete }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      athlete: null,
      setAuth: (data) => set({ ...data }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, expiresAt: null, athlete: null }),
      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        // Check if token is expired (adding 5 min buffer)
        return Date.now() / 1000 < expiresAt - 300;
      },
    }),
    {
      name: 'strava-auth-storage',
    }
  )
);
