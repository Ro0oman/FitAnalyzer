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
  isDemo: boolean;
  setAuth: (data: { accessToken: string; refreshToken: string; expiresAt: number; athlete: Athlete }) => void;
  setDemoAuth: () => void;
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
      isDemo: false,
      setAuth: (data) => set({ ...data, isDemo: false }),
      setDemoAuth: () => set({
        accessToken: 'demo_token',
        refreshToken: 'demo_refresh',
        expiresAt: Math.floor(Date.now() / 1000) + 3600 * 24 * 365, // 1 year
        isDemo: true,
        athlete: {
          id: 123456,
          username: 'testathlete',
          firstname: 'Test',
          lastname: 'Athlete',
          profile: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=200&auto=format&fit=crop'
        }
      }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, expiresAt: null, athlete: null, isDemo: false }),
      isAuthenticated: () => {
        const { accessToken, expiresAt, isDemo } = get();
        if (isDemo) return true;
        if (!accessToken || !expiresAt) return false;
        return Date.now() / 1000 < expiresAt - 300;
      },
    }),
    {
      name: 'strava-auth-storage',
    }
  )
);
