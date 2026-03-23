'use client';

import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useMemo } from 'react';

export function VO2MaxChart() {
  const data = useMemo(() => {
    const arr = [];
    let base = 48;
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 3);
      base += (Math.random() - 0.4) * 0.5; // Slight upward trend
      arr.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        VO2Max: parseFloat(base.toFixed(1)),
      });
    }
    return arr;
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
      <div className="mb-6 text-left">
        <h3 className="text-xl font-semibold">VO2Max Estimation</h3>
        <p className="text-sm text-muted-foreground">Calculated cardiovascular fitness trend</p>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']}
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
            <Line 
              type="monotone" 
              dataKey="VO2Max" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
