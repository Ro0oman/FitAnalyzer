'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { LogOut, Save, User } from 'lucide-react';

export default function SettingsPage() {
  const { athlete, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
            {athlete?.profile && athlete.profile !== 'avatar/athlete/large.png' ? (
              <img src={athlete.profile} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{athlete?.firstname} {athlete?.lastname}</h2>
            <p className="text-sm text-muted-foreground">Connected via Strava</p>
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-4">
          <h3 className="font-medium text-lg">Physiological Settings</h3>
          <p className="text-sm text-muted-foreground">
            Adjust these values to improve the accuracy of the training load and VO2Max estimations. 
            (Currently read-only / calculated automatically from your Strava data).
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Max Heart Rate</label>
              <input 
                type="number" 
                defaultValue={190} 
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Resting Heart Rate</label>
              <input 
                type="number" 
                defaultValue={60} 
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" 
              />
            </div>
          </div>
          
          <button disabled className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 mt-2 opacity-50 cursor-not-allowed">
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>

        <div className="pt-6 border-t border-border space-y-4">
          <h3 className="text-destructive font-medium text-lg">Danger Zone</h3>
          <p className="text-sm text-muted-foreground text-balance">
            This will completely remove your local session and clear the cached tokens. 
            No data is stored in our servers, so this effectively deletes your local "account" from this browser.
          </p>
          <button 
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20 h-10 px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Strava
          </button>
        </div>
      </div>
    </div>
  );
}
