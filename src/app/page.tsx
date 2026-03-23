'use client';

import { Activity, ArrowRight, TrendingUp, Zap, BarChart3, LineChart, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoCharts } from "@/components/DemoCharts";
import { VolumeChart } from "@/components/VolumeChart";
import { VO2MaxChart } from "@/components/VO2MaxChart";
import { DemoStats } from "@/components/DemoStats";
import { ActivityCards } from "@/components/ActivityCards";
import { ActivityDetail } from "@/components/ActivityDetail";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Home() {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  useEffect(() => {
     const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
     const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : 'http://localhost:3000/api/auth/callback';
     const SCOPES = "read,activity:read_all";
     setAuthUrl(`https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=${SCOPES}`);
  }, []);

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[90vh] bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <ActivityDetail 
                  activity={selectedActivity} 
                  onClose={() => setSelectedActivity(null)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm relative">
              <Activity className="w-10 h-10 text-primary relative z-10" />
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 leading-tight">
              Analyze your performance <br className="hidden md:block" />
              <span className="text-primary italic">like a pro</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect your Strava to unlock advanced VO2Max estimation, Fitness-Fatigue modeling, and detailed workload analysis.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={authUrl || '#'}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#fc4c02] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[#fc4c02]/20 hover:bg-[#e34402] transition-all hover:scale-105 active:scale-95"
            >
              Connect with Strava
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#demo" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-background/50 backdrop-blur-sm px-10 py-4 text-base font-semibold hover:bg-accent transition-colors">
              Explore Demo
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="demo" className="py-20 bg-muted/20 border-t border-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <LayoutDashboard className="w-3 h-3" />
                Preview Mode
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your future dashboard</h2>
              <p className="text-muted-foreground max-w-xl">
                This is what your data will look like once analyzed. Every metric is calculated locally for maximum privacy.
              </p>
            </div>
            <div className="hidden md:block text-right text-xs text-muted-foreground">
              Showing data for <span className="text-foreground font-semibold">@TestAthlete</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8">
            <DemoStats />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-1 rounded-3xl bg-gradient-to-br from-primary/20 via-border to-transparent shadow-2xl">
                <div className="bg-card rounded-[22px] overflow-hidden">
                  <DemoCharts />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-1 rounded-3xl bg-gradient-to-br from-blue-500/10 via-border to-transparent shadow-xl">
                  <div className="bg-card rounded-[22px] overflow-hidden">
                    <VolumeChart />
                  </div>
                </div>
                <div className="p-1 rounded-3xl bg-gradient-to-br from-purple-500/10 via-border to-transparent shadow-xl">
                  <div className="bg-card rounded-[22px] overflow-hidden">
                    <VO2MaxChart />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Activities */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                <ActivityCards onSelect={setSelectedActivity} />
                
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Zap className="w-5 h-5" />
                    Did you know?
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By analyzing your heart rate and pace/power data over time, FitAnalyzer can predict your performance window and suggest recovery days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid / CTA */}
      <section className="py-24 px-6 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-bold tracking-tight">Ready to see your own data?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-bold">Performance Trends</h4>
              <p className="text-sm text-muted-foreground">Track how your cardiovascular fitness evolves over months of training.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-bold">Workload Analysis</h4>
              <p className="text-sm text-muted-foreground">Understand your training stress and avoid the "red zone" of overtraining.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <LineChart className="w-6 h-6" />
              </div>
              <h4 className="font-bold">VO2Max Discovery</h4>
              <p className="text-sm text-muted-foreground">Get an estimated VO2Max for every activity that includes pulse data.</p>
            </div>
          </div>
          
          <div className="pt-8">
            <a
              href={authUrl || '#'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fc4c02] px-12 py-5 text-lg font-bold text-white shadow-2xl shadow-[#fc4c02]/30 hover:bg-[#e34402] transition-all hover:scale-105"
            >
              Get Started with Strava
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 FitAnalyzer. Not affiliated with Strava, Inc. Your data stay on your device.
        </p>
      </footer>
    </main>
  );
}
