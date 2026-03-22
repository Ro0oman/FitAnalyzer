'use client';

import { useMemo, useState } from 'react';
import { StravaActivity } from '@/services/strava';
import { startOfWeek, subWeeks, format, differenceInWeeks } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight, CalendarDays, Footprints, Dumbbell } from 'lucide-react';

interface TrainingCalendarProps {
  activities: StravaActivity[];
  onSelectActivity: (activity: StravaActivity | null) => void;
}

export function TrainingCalendar({ activities, onSelectActivity }: TrainingCalendarProps) {
  const [weeksToShow, setWeeksToShow] = useState<number>(52); // Default 1 Year
  const [pageOffset, setPageOffset] = useState<number>(0); // 0 = current, 1 = previous block, etc.

  const today = new Date();
  
  const { calendarData, streaks } = useMemo(() => {
    // Offset calculation
    const currentEnd = subWeeks(today, pageOffset * weeksToShow);
    const startDate = startOfWeek(subWeeks(currentEnd, weeksToShow - 1), { weekStartsOn: 1 });

    const days = [];
    let current = startDate;
    const totalDays = weeksToShow * 7;
    
    const activityMap = new Map<string, StravaActivity[]>();
    activities.forEach(act => {
      const dateStr = act.start_date.split('T')[0];
      const existing = activityMap.get(dateStr) || [];
      existing.push(act);
      activityMap.set(dateStr, existing);
    });

    for (let i = 0; i < totalDays; i++) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const dayActs = activityMap.get(dateStr) || [];
        
        const totalDistance = dayActs.reduce((acc, a) => acc + (a.distance || 0), 0) / 1000;
        
        let level = 0;
        if (dayActs.length > 0) {
            if (totalDistance > 20) level = 4;
            else if (totalDistance > 10) level = 3;
            else if (totalDistance > 5) level = 2;
            else level = 1;
        }

        days.push({
            date: current,
            dateStr,
            activities: dayActs,
            level,
            totalDistance
        });

        current = new Date(current);
        current.setDate(current.getDate() + 1);
    }

    const weeksMap = new Map<number, boolean>();
    activities.forEach(act => {
        const actDate = new Date(act.start_date);
        const diff = differenceInWeeks(today, actDate);
        if (diff >= 0) weeksMap.set(diff, true);
    });

    let currentStreak = 0;
    while(weeksMap.get(currentStreak)) currentStreak++;
    if (currentStreak === 0 && weeksMap.get(1)) {
        let tempStreak = 1;
        while(weeksMap.get(tempStreak)) tempStreak++;
        currentStreak = tempStreak;
    }

    let longestStreak = 0;
    let temp = 0;
    for (let i=0; i < 52; i++) { 
        if (weeksMap.get(i)) {
            temp++;
            if (temp > longestStreak) longestStreak = temp;
        } else {
            temp = 0;
        }
    }

    return { calendarData: days, streaks: { currentStreak, longestStreak } };
  }, [activities, weeksToShow, pageOffset]);

  const getLevelClass = (level: number) => {
    if (level === 0) return 'bg-secondary border border-border/50 text-transparent';
    if (level === 1) return 'bg-orange-950 border border-orange-900 shadow-[0_0_8px_rgba(154,52,18,0.2)] text-orange-900';
    if (level === 2) return 'bg-orange-800 border border-orange-700 shadow-[0_0_12px_rgba(194,65,12,0.4)] text-orange-800';
    if (level === 3) return 'bg-orange-600 border border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.6)] text-orange-600';
    return 'bg-primary border border-primary shadow-[0_0_20px_rgba(252,76,2,0.8)] text-primary'; 
  };

  const handleNext = () => { if (pageOffset > 0) setPageOffset(p => p - 1); };
  const handlePrev = () => { setPageOffset(p => p + 1); };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10 border-b border-border/50 pb-6 mb-6">
        <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" /> Training Heatmap
            </h3>
            <p className="text-sm text-muted-foreground mt-1 text-balance">Review your consistency and training load day by day.</p>
            
            <div className="mt-4 flex items-center gap-2 bg-secondary/50 p-1 rounded-lg w-max">
                 <button onClick={() => {setWeeksToShow(12); setPageOffset(0);}} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${weeksToShow===12 ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}>12 Weeks</button>
                 <button onClick={() => {setWeeksToShow(24); setPageOffset(0);}} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${weeksToShow===24 ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}>6 Months</button>
                 <button onClick={() => {setWeeksToShow(52); setPageOffset(0);}} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${weeksToShow===52 ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}>1 Year</button>
            </div>
        </div>
        
        <div className="flex gap-4 items-center">
            {/* Pagination Controls */}
            <div className="flex items-center bg-secondary rounded-lg overflow-hidden border border-border mr-4">
                <button onClick={handlePrev} className="px-3 py-2 hover:bg-white/10 text-muted-foreground transition-colors" title="Older">
                   <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-2 text-xs font-bold font-mono text-center min-w-[80px] bg-black/20">
                    Page -{pageOffset}
                </div>
                <button onClick={handleNext} disabled={pageOffset===0} className="px-3 py-2 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground transition-colors" title="Newer">
                   <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-col bg-background/50 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Streak</span>
                <span className="text-2xl font-black text-foreground flex items-center gap-1">
                    {streaks.currentStreak} <span className="text-sm font-normal text-muted-foreground">wks</span>
                </span>
            </div>
            <div className="flex flex-col bg-background/50 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Best</span>
                <span className="text-2xl font-black text-foreground flex items-center gap-1">
                    {streaks.longestStreak} <span className="text-sm font-normal text-muted-foreground">wks</span>
                </span>
            </div>
        </div>
      </div>

      <div className="flex justify-center md:justify-start overflow-x-auto pb-6 pt-2 custom-scrollbar relative z-10 w-full snap-x">
        <AnimatePresence mode="wait">
        <motion.div 
           key={`${weeksToShow}-${pageOffset}`}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
           className="flex gap-1.5 min-w-max"
        >
            {Array.from({ length: weeksToShow }).map((_, weekIdx) => {
               const weekDays = calendarData.slice(weekIdx * 7, (weekIdx + 1) * 7);
               
               // Calculate weekly total for tooltip
               const weekTotalKm = weekDays.reduce((acc, d) => acc + d.totalDistance, 0);
               const weekActs = weekDays.reduce((acc, d) => acc + d.activities.length, 0);

               return (
                  <div key={`w-${weekIdx}`} className="flex flex-col gap-1.5 relative group/col">
                      {/* Weekly Summary Tooltip (Appears above the column on hover) */}
                      <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-2xl border border-border opacity-0 group-hover/col:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap lg:flex flex-col items-center hidden">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Week Summary</span>
                          <span className="font-black text-primary">{weekTotalKm.toFixed(1)} km</span>
                          <span className="text-muted-foreground">{weekActs} activities</span>
                      </div>

                      {weekDays.map((day, dayIdx) => (
                          <motion.div
                             key={day.dateStr}
                             initial={{ opacity: 0, scale: 0.5 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: (weekIdx * 0.01) + (dayIdx * 0.005), duration: 0.3 }}
                             onClick={() => day.activities.length > 0 && onSelectActivity(day.activities[0])}
                             className={`w-4 h-4 md:w-5 md:h-5 rounded-sm sm:rounded-md cursor-pointer transition-all duration-200 relative group/cell flex items-center justify-center
                                ${getLevelClass(day.level)} ${day.activities.length === 0 ? 'hover:bg-secondary/80' : 'hover:ring-2 hover:ring-white/50 hover:scale-110 z-10'}
                             `}
                          >
                             {day.activities.length > 0 && (
                                <>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                      {day.activities[0].type === 'Run' ? <Footprints className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <Dumbbell className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                                  </div>
                                  <div className="absolute top-[120%] left-1/2 -translate-x-1/2 mt-1 px-3 py-1.5 bg-black/90 backdrop-blur-md text-white text-xs rounded-md shadow-xl border border-border/50 opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-[60] whitespace-nowrap hidden sm:block">
                                      <p className="font-bold text-primary">{format(day.date, 'MMM do, yyyy')}</p>
                                      <p>{day.activities.length} activity(s) • {day.activities[0].type}</p>
                                  </div>
                                </>
                             )}
                          </motion.div>
                      ))}
                  </div>
               );
            })}
        </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground relative z-10">
          <div className="flex items-center gap-2">
             <CalendarDays className="w-4 h-4" />
             <span>Showing {weeksToShow} weeks {pageOffset > 0 && `(Offset by ${pageOffset * weeksToShow} weeks)`}</span>
          </div>
          <div className="flex items-center gap-2">
             <span>Less</span>
             {[0, 1, 2, 3, 4].map(l => (
                 <div key={l} className={`w-3 h-3 rounded-sm ${getLevelClass(l)}`}></div>
             ))}
             <span>More</span>
          </div>
      </div>
    </div>
  );
}
