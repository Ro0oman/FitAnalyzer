'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthSuccessPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read the payload from the hash part of the URL (never sent to the server)
    const hash = window.location.hash;
    if (hash && hash.includes('payload=')) {
      try {
        const payloadBase64 = hash.split('payload=')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        if (decodedPayload.accessToken) {
          setAuth(decodedPayload);
          // Redirect to dashboard now that we have the tokens
          router.replace('/dashboard');
        } else {
          setError('Invalid payload received.');
        }
      } catch (err) {
        console.error('Failed to parse auth payload:', err);
        setError('Failed to authenticate.');
      }
    } else {
      setError('No authentication payload found.');
    }
  }, [router, setAuth]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <button 
          onClick={() => router.replace('/')}
          className="rounded-md bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
      <h1 className="text-xl font-medium animate-pulse">Completing connection...</h1>
    </div>
  );
}
