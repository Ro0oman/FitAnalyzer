'use client';

import { useMemo } from 'react';
import { StravaActivity } from '@/services/strava';
import { calculateTRIMP } from '@/lib/metrics';
import { startOfWeek, endOfWeek, format, differenceInWeeks, parseISO } from 'date-fns';

interface TrainingStatsTableProps {
  activities: StravaActivity[];
}

interface WeekStat {
  weekKey: string;
  startDate: Date;
  endDate: Date;
  runDistance: number;
  totalDistance: number;
  totalTime: number; // in seconds
  hrSum: number;
  hrCount: number;
  trimp: number;
  activityCount: number;
  runsCount: number;
}

export function TrainingStatsTable({ activities }: TrainingStatsTableProps) {
  
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const map = new Map<number, WeekStat>();

    // Generate last 10 weeks structure
    for(let i=0; i<10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        const s = startOfWeek(d, { weekStartsOn: 1 });
        const e = endOfWeek(d, { weekStartsOn: 1 });
        map.set(i, {
            weekKey: `Week ${format(s, 'wo')} (${format(s, 'dd.MM')} - ${format(e, 'dd.MM')})`,
            startDate: s,
            endDate: e,
            runDistance: 0,
            totalDistance: 0,
            totalTime: 0,
            hrSum: 0,
            hrCount: 0,
            trimp: 0,
            activityCount: 0,
            runsCount: 0,
        });
    }

    activities.forEach(act => {
        const date = parseISO(act.start_date);
        const diff = differenceInWeeks(today, date);
        if (diff >= 0 && diff < 10) {
            const stat = map.get(diff)!;
            const distKm = act.distance / 1000;
            stat.totalDistance += distKm;
            if (act.type === 'Run') {
                stat.runDistance += distKm;
                stat.runsCount++;
            }
            stat.totalTime += act.moving_time;
            stat.trimp += calculateTRIMP(act);
            stat.activityCount++;
            if (act.average_heartrate) {
                stat.hrSum += act.average_heartrate;
                stat.hrCount++;
            }
        }
    });

    return Array.from(map.values());
  }, [activities]);

  const formatHours = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}:${m.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-xl w-full overflow-hidden">
       <div className="flex flex-col mb-4">
           <h3 className="text-xl font-bold">Últimas 10 semanas de entrenamiento</h3>
           <p className="text-xs text-muted-foreground mt-1">Comparativa tipo Runalyze con carga e intensidad semanal.</p>
       </div>
       
       <div className="overflow-x-auto custom-scrollbar">
           <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                  <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-lg">Semana</th>
                      <th className="px-4 py-3 font-semibold text-center">Sesiones</th>
                      <th className="px-4 py-3 font-semibold text-right">Running Km</th>
                      <th className="px-4 py-3 font-semibold text-right">Duración</th>
                      <th className="px-4 py-3 font-semibold text-center">Avg HR</th>
                      <th className="px-4 py-3 font-semibold text-right">TRIMP</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                 {weeklyStats.map((stat, i) => (
                    <tr key={i} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{stat.weekKey}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                            {stat.activityCount > 0 ? `${stat.activityCount}x` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                            {stat.runDistance > 0 ? (
                                <span className="font-bold">{stat.runDistance.toFixed(1)} km</span>
                            ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                            {stat.totalTime > 0 ? formatHours(stat.totalTime) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                            {stat.hrCount > 0 ? `${Math.round(stat.hrSum / stat.hrCount)} bpm` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                           {stat.trimp > 0 ? (
                               <span className="font-bold text-primary">{Math.round(stat.trimp)}</span>
                           ) : '-'}
                        </td>
                    </tr>
                 ))}
              </tbody>
           </table>
       </div>
    </div>
  );
}
