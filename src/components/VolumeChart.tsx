'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { InfoTooltip } from './InfoTooltip';

export function VolumeChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = useMemo(() => {
    const weeks = ['12w ago', '11w ago', '10w ago', '9w ago', '8w ago', '7w ago', '6w ago', '5w ago', '4w ago', '3w ago', '2w ago', 'Last Week'];
    return weeks.map(week => ({
      week,
      Distance: Math.floor(Math.random() * 40) + 20,
      Elevation: Math.floor(Math.random() * 800) + 200,
    }));
  }, []);

  if (!mounted) return <div className="w-full h-[350px] flex items-center justify-center text-muted-foreground italic text-sm">Loading Chart...</div>;

  return (
    <div className="w-full h-full min-h-[350px] p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
      <div className="mb-6 text-left">
        <div className="flex items-center">
          <h3 className="text-xl font-semibold">Training Volume</h3>
          <InfoTooltip 
            title="Volume Analysis" 
            content="Distance and elevation gain aggregated by week to track your workload consistency over time." 
          />
        </div>
        <p className="text-sm text-muted-foreground">Weekly mileage and elevation gain</p>
      </div>
      <div className="w-full h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="week" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ fontSize: 14 }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            />
            <Bar dataKey="Distance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Distance (km)" />
            <Bar dataKey="Elevation" fill="#10b981" radius={[4, 4, 0, 0]} name="Elevation (m)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
