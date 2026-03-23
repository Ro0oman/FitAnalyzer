'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { InfoTooltip } from './InfoTooltip';

export function DemoCharts() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = useMemo(() => {
    const arr = [];
    let fitness = 40;
    let fatigue = 35;
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const stress = Math.random() > 0.6 ? 50 + Math.random() * 100 : 0;
      
      fitness = fitness + (stress - fitness) * (1 - Math.exp(-1/42));
      fatigue = fatigue + (stress - fatigue) * (1 - Math.exp(-1/7));
      const form = fitness - fatigue;

      arr.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Fitness: Math.round(fitness),
        Fatigue: Math.round(fatigue),
        Form: Math.round(form),
      });
    }
    return arr;
  }, []);

  if (!mounted) return <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground italic text-sm">Loading Chart...</div>;

  return (
    <div className="w-full h-full min-h-[400px] p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
      <div className="mb-6 text-left">
        <div className="flex items-center">
          <h3 className="text-xl font-semibold">Performance Modeling</h3>
          <InfoTooltip 
            title="Fitness Modeling" 
            content="Chronic Training Load (CTL) follows fitness, Acute Training Load (ATL) follows fatigue, and Training Stress Balance (TSB) shows your freshness/readiness to race." 
          />
        </div>
        <p className="text-sm text-muted-foreground">Preview of your Fitness (CTL), Fatigue (ATL), and Form (TSB)</p>
      </div>
      <div className="w-full h-[320px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ fontSize: 14 }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="Fitness" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorFitness)" 
            />
            <Area 
              type="monotone" 
              dataKey="Fatigue" 
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorFatigue)" 
            />
            <Area 
              type="monotone" 
              dataKey="Form" 
              stroke="#f59e0b" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorForm)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
