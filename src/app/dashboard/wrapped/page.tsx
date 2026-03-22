'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchRecentActivities, StravaActivity } from '@/services/strava';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Trophy, Flame, Share2, Activity, MapPin, HeartPulse } from 'lucide-react';
import { predictRaceTimes, estimateVO2Max } from '@/lib/metrics';

export default function WrappedPage() {
  const { isAuthenticated, athlete } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/');
      return;
    }
    fetchRecentActivities().then(res => {
      setActivities(res);
      setLoading(false);
    });
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Pre-calculate data for slides
  const totalDistance = activities.reduce((acc, a) => acc + (a.distance || 0), 0) / 1000;
  const totalElevation = activities.reduce((acc, a) => acc + (a.total_elevation_gain || 0), 0);
  const totalTimeHours = activities.reduce((acc, a) => acc + (a.moving_time || 0), 0) / 3600;

  const longestActivity = [...activities].sort((a,b) => b.distance - a.distance)[0];
  
  const vo2max = estimateVO2Max(activities);
  const predictions = predictRaceTimes(vo2max);

  const slides = [
    // 0: Intro
    <div key="intro" className="flex flex-col items-center justify-center h-full text-center space-y-6">
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
           <Flame className="w-24 h-24 text-primary bg-primary/20 p-4 rounded-full" />
       </motion.div>
       <h1 className="text-5xl font-black bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Ready for your Year in Sport, {athlete?.firstname}?</h1>
       <p className="text-xl text-muted-foreground max-w-lg">Discover your true performance evolution, powered by FitAnalyzer Pro AI.</p>
    </div>,

    // 1: Big numbers
    <div key="stats" className="flex flex-col items-center justify-center h-full text-center space-y-12">
       <h2 className="text-4xl font-bold">You put in the work.</h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
           <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card p-8 rounded-2xl border border-border shadow-xl">
               <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
               <div className="text-5xl font-black">{Math.round(totalDistance)} <span className="text-2xl text-muted-foreground">km</span></div>
               <p className="text-sm uppercase tracking-widest text-muted-foreground mt-2">Distance</p>
           </motion.div>
           <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card p-8 rounded-2xl border border-border shadow-xl">
               <Activity className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
               <div className="text-5xl font-black">{Math.round(totalElevation)} <span className="text-2xl text-muted-foreground">m</span></div>
               <p className="text-sm uppercase tracking-widest text-muted-foreground mt-2">Elevation Gain</p>
           </motion.div>
           <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-card p-8 rounded-2xl border border-border shadow-xl">
               <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
               <div className="text-5xl font-black">{Math.round(totalTimeHours)} <span className="text-2xl text-muted-foreground">h</span></div>
               <p className="text-sm uppercase tracking-widest text-muted-foreground mt-2">Time Active</p>
           </motion.div>
       </div>
    </div>,

    // 2: Best Activity
    <div key="best" className="flex flex-col items-center justify-center h-full text-center space-y-8">
       <h2 className="text-4xl font-bold">Your Epic Adventure</h2>
       {longestActivity && (
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-primary/80 to-rose-600/80 p-1 rounded-3xl max-w-2xl w-full">
               <div className="bg-card rounded-[22px] p-8 h-full w-full">
                  <span className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">Longest Session</span>
                  <h3 className="text-3xl font-black mt-4 mb-6">{longestActivity.name}</h3>
                  <div className="flex justify-around">
                      <div>
                          <p className="text-3xl font-bold text-primary">{(longestActivity.distance / 1000).toFixed(1)} km</p>
                          <p className="text-xs text-muted-foreground uppercase">Distance</p>
                      </div>
                      <div>
                          <p className="text-3xl font-bold text-amber-500">{Math.floor(longestActivity.moving_time / 60)} min</p>
                          <p className="text-xs text-muted-foreground uppercase">Time</p>
                      </div>
                  </div>
               </div>
           </motion.div>
       )}
    </div>,

    // 3: Predictions & Ending
    <div key="ending" className="flex flex-col items-center justify-center h-full text-center space-y-8">
       <HeartPulse className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
       <h2 className="text-4xl font-bold">Your Potential Unleashed</h2>
       <p className="text-lg text-muted-foreground">Based on your {vo2max} Est. VO2Max, your predicted race times are:</p>
       
       <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
           <div className="bg-secondary/50 p-4 border border-border rounded-xl">
              <p className="text-sm text-muted-foreground">5K</p>
              <p className="text-2xl font-black">{predictions.fiveK}</p>
           </div>
           <div className="bg-secondary/50 p-4 border border-border rounded-xl">
              <p className="text-sm text-muted-foreground">10K</p>
              <p className="text-2xl font-black">{predictions.tenK}</p>
           </div>
           <div className="bg-secondary/50 p-4 border border-border rounded-xl">
              <p className="text-sm text-muted-foreground">Half Marathon</p>
              <p className="text-2xl font-black">{predictions.halfMarathon}</p>
           </div>
           <div className="bg-secondary/50 p-4 border border-border rounded-xl">
              <p className="text-sm text-muted-foreground">Marathon</p>
              <p className="text-2xl font-black">{predictions.marathon}</p>
           </div>
       </motion.div>

       <button className="mt-12 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(252,76,2,0.4)]">
           <Share2 className="w-5 h-5" /> Share Your Year
       </button>
    </div>
  ];

  return (
    <div className="absolute inset-0 z-50 bg-background overflow-hidden flex flex-col">
       {/* Progress Bar */}
       <div className="h-2 w-full bg-secondary flex gap-1 px-1 pt-1 absolute top-0 left-0 z-50">
           {slides.map((_, i) => (
               <div key={i} className="h-1 flex-1 bg-black/50 rounded-full overflow-hidden">
                   <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: slide >= i ? '100%' : '0%' }}
                      transition={{ duration: slide === i ? 0.3 : 0 }}
                   />
               </div>
           ))}
       </div>
       
       <button onClick={() => router.push('/dashboard')} className="absolute top-6 right-6 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
           <span className="sr-only">Close</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
       </button>

       {/* Slides */}
       <div className="flex-1 relative w-full h-full p-6 pb-24">
           <AnimatePresence mode="wait">
               <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center p-8"
               >
                   {slides[slide]}
               </motion.div>
           </AnimatePresence>
       </div>

       {/* Controls */}
       <div className="absolute bottom-8 left-0 w-full flex justify-between px-12 z-50">
           <button 
             onClick={() => setSlide(s => Math.max(0, s - 1))}
             disabled={slide === 0}
             className="p-4 bg-secondary text-secondary-foreground rounded-full disabled:opacity-30 transition-opacity"
           >
              <ArrowLeft className="w-6 h-6" />
           </button>
           <button 
             onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))}
             disabled={slide === slides.length - 1}
             className="p-4 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 disabled:opacity-30 transition-opacity"
           >
              <ArrowRight className="w-6 h-6" />
           </button>
       </div>
    </div>
  );
}
