'use client';

import { Activity, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoCharts } from "@/components/DemoCharts";

export default function Home() {
  const [authUrl, setAuthUrl] = useState<string>('');

  useEffect(() => {
     const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
     const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : 'http://localhost:3000/api/auth/callback';
     const SCOPES = "read,activity:read_all";
     setAuthUrl(`https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=${SCOPES}`);
  }, []);

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm relative">
              <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-full z-0" />
              <Activity className="w-14 h-14 text-primary relative z-10" />
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Unleash your true <br className="hidden md:block" />
              <span className="text-primary">athletic potential</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Advanced performance analytics, estimated VO2Max, and fitness-fatigue modeling driven by your actual Strava data. Elevate your training.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={authUrl || '#'}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#fc4c02] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#fc4c02]/20 hover:bg-[#e34402] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fc4c02] transition-all hover:scale-105 active:scale-95"
            >
              Connect with Strava
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#demo" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-base font-semibold hover:bg-accent hover:text-accent-foreground transition-colors">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            Fast, secure, and fully private. We don't store your data.
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Data-driven insights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Visualize your progress using the exact same metrics professionals use. Predict peak performance and avoid overtraining.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-blue-500 font-semibold mb-2">
                  <TrendingUp className="w-5 h-5" />
                  Fitness (CTL)
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Chronic Training Load represents your long-term fitness. It builds up slowly over weeks of consistent training.
                </p>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-red-500 font-semibold mb-2">
                  <Activity className="w-5 h-5" />
                  Fatigue (ATL)
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Acute Training Load shows the short-term impact of your recent workouts. It spikes quickly after hard efforts.
                </p>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-amber-500 font-semibold mb-2">
                  <Zap className="w-5 h-5" />
                  Form (TSB)
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Training Stress Balance is your freshness. A positive number means you are rested and ready to peak for an event.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-primary/10 bg-card p-2 md:p-6 shadow-2xl glass-panel relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <DemoCharts />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
