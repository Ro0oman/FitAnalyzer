'use client';

import { useMemo, useState } from 'react';
import { StravaActivity } from '@/services/strava';
import { startOfWeek, endOfWeek, format, differenceInWeeks, parseISO } from 'date-fns';
import { calculateTRIMP } from '@/lib/metrics';
import { BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart } from 'recharts';

interface WeeklyComparisonChartProps {
  activities: StravaActivity[];
}

export function WeeklyComparisonChart({ activities }: WeeklyComparisonChartProps) {
  const [weeksToShow, setWeeksToShow] = useState<number>(12); // Default 12 weeks for the chart

  const chartData = useMemo(() => {
    const today = new Date();
    const map = new Map<number, any>();

    // Generate weekly buckets (from oldest to newest for the chart)
    for (let i = weeksToShow - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        const s = startOfWeek(d, { weekStartsOn: 1 });
        
        map.set(i, {
            weekLabel: `W${format(s, 'wo')}`,
            distance: 0,
            fatigue: 0,
            index: i
        });
    }

    activities.forEach(act => {
        const date = parseISO(act.start_date);
        const diff = differenceInWeeks(today, date);
        if (diff >= 0 && diff < weeksToShow) {
            const stat = map.get(diff)!;
            const distKm = act.distance / 1000;
            // Only count distance if it's a run, or count all? Usually KM is for Run/Ride. Let's count Run distance specifically for the blue bar, or all distance.
            if (act.type === 'Run') {
                stat.distance += distKm;
            }
            // Fatigue applies to all activities
            stat.fatigue += calculateTRIMP(act);
        }
    });

    // The map is keyed by `diff` (0 is this week, 1 is last week).
    // We want to sort from oldest (highest diff) to newest (0).
    const sorted = Array.from(map.values()).sort((a, b) => b.index - a.index);
    return sorted;
  }, [activities, weeksToShow]);

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-xl w-full flex flex-col mt-6">
      
      <div className="flex flex-col mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
             Weekly Progress & Fatigue
          </h3>
          <p className="text-sm text-muted-foreground mt-1 text-balance">Track your running volume vs cardiovascular load.</p>
      </div>

      {/* 100% Width Segmented Controls */}
      <div className="grid grid-cols-3 bg-secondary/60 p-1.5 rounded-xl w-full mb-8 shadow-inner border border-border/50">
           <button 
              onClick={() => setWeeksToShow(12)} 
              className={`py-2 text-sm font-bold rounded-lg transition-all ${weeksToShow===12 ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-muted-foreground hover:text-white'}`}>
              12 Weeks
           </button>
           <button 
              onClick={() => setWeeksToShow(24)} 
              className={`py-2 text-sm font-bold rounded-lg transition-all ${weeksToShow===24 ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-muted-foreground hover:text-white'}`}>
              6 Months
           </button>
           <button 
              onClick={() => setWeeksToShow(52)} 
              className={`py-2 text-sm font-bold rounded-lg transition-all ${weeksToShow===52 ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-muted-foreground hover:text-white'}`}>
              1 Year
           </button>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="weekLabel" stroke="#71717a" fontSize={10} tickMargin={10} minTickGap={15} />
            <YAxis yAxisId="left" stroke="#71717a" fontSize={10} />
            <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} />
            <Tooltip 
               contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
               itemStyle={{ fontWeight: 'bold' }}
               labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            <Bar yAxisId="left" dataKey="distance" name="Run Distance (km)" fill="#fc4c02" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="fatigue" name="Total Fatigue (TRIMP)" stroke="#3b82f6" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
