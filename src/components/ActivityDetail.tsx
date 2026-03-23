'use client';

import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Heart, 
  Navigation, 
  Timer, 
  TrendingUp, 
  Zap, 
  MapPin, 
  ChevronRight,
  TrendingDown,
  Activity
} from "lucide-react";
import { useMemo, useState, useEffect } from 'react';

export function ActivityDetail({ activity, onClose }: { activity: any; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const heartRateData = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      time: i,
      hr: Math.floor(Math.random() * 40) + activity.avgHeartRate - 20
    }));
  }, [activity]);

  const zoneData = [
    { name: 'Z1', value: 10, color: '#94a3b8' },
    { name: 'Z2', value: 25, color: '#3b82f6' },
    { name: 'Z3', value: 35, color: '#10b981' },
    { name: 'Z4', value: 20, color: '#f59e0b' },
    { name: 'Z5', value: 10, color: '#ef4444' },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
            <MapPin className="w-3 h-3" />
            {activity.type} Analysis
          </div>
          <h2 className="text-3xl font-bold">{activity.name}</h2>
          <p className="text-muted-foreground">{activity.date} • Recorded with Wahoo BOLT</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground font-medium">VO2Max Discovery</p>
            <div className="flex items-center gap-2 text-2xl font-bold text-purple-500">
              <Zap className="w-5 h-5" />
              52.4
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Distance</p>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold">{activity.distance}</span>
          </div>
        </div>
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Moving Time</p>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold">{activity.time}</span>
          </div>
        </div>
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Elev Gain</p>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold">{activity.elevation}</span>
          </div>
        </div>
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Calories</p>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold">{activity.calories}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heart Rate Analysis */}
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Heart Rate Intensity
          </h3>
          <div className="p-6 bg-card rounded-3xl border border-border shadow-sm h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heartRateData}>
                <defs>
                  <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="hr" stroke="#ef4444" fillOpacity={1} fill="url(#colorHR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
              <span className="text-xs text-muted-foreground">Average HR</span>
              <span className="font-bold">{activity.avgHeartRate} bpm</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
              <span className="text-xs text-muted-foreground">Max HR</span>
              <span className="font-bold">{activity.maxHeartRate} bpm</span>
            </div>
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Time in Zones
          </h3>
          <div className="p-6 bg-card rounded-3xl border border-border shadow-sm h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} layout="vertical" margin={{ left: -30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            You spent <span className="text-foreground font-bold italic">35%</span> of your time in threshold zone (Z3).
          </p>
        </div>
      </div>

      {/* Effort Prediction Card */}
      <div className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[32px] border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:scale-110 transition-transform duration-500">
          <Activity className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            AI Insight
          </div>
          <h4 className="text-xl font-bold italic">Productive Effort Detected</h4>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            This activity contributed <span className="text-primary font-bold">+1.2</span> to your Chronic Training Load (CTL). 
            Based on your heart rate variability during this effort, we recommend <span className="text-emerald-500 font-bold">24 hours</span> of low-intensity recovery.
          </p>
          <div className="pt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold">Recovery state: Optimal</span>
            </div>
            <button className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
              Analyze load balance <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
