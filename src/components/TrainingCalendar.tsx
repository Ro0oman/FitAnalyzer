'use client';

import { useMemo } from 'react';
import { StravaActivity } from '@/services/strava';
import { startOfWeek, subWeeks, subDays, format, differenceInWeeks, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Dumbbell, Flame } from 'lucide-react';

interface TrainingCalendarProps {
  activities: StravaActivity[];
  onSelectActivity: (activity: StravaActivity | null) => void;
  weeksToShow?: number;
}

export function TrainingCalendar({ activities, onSelectActivity, weeksToShow = 12 }: TrainingCalendarProps) {
  // We want to show the last N weeks up to today. 
  // Each column is a week, each row is a day of the week.
  const today = new Date();
  const startDate = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 1 }); // Start on Monday
  
  const calendarData = useMemo(() => {
    // Generate empty calendar
    const days = [];
    let current = startDate;
    const totalDays = weeksToShow * 7;
    
    // Create map of dates to exact activities 
    // Format: YYYY-MM-DD
    const activityMap = new Map<string, StravaActivity[]>();
    activities.forEach(act => {
      const dateStr = act.start_date.split('T')[0];
      const existing = activityMap.get(dateStr) || [];
      existing.push(act);
      activityMap.set(dateStr, existing);
    });

    // Populate calendar array
    for (let i = 0; i < totalDays; i++) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const dayActs = activityMap.get(dateStr) || [];
        
        // Calculate total TRIMP or Distance to color the block
        const totalDistance = dayActs.reduce((acc, a) => acc + (a.distance || 0), 0) / 1000;
        
        // Determine intensity level (0 to 4) for coloring
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

        // Next day
        current = new Date(current);
        current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [activities, startDate, weeksToShow]);

  // Streak Calculation
  const streaks = useMemo(() => {
    // Weekly streak: consecutive weeks with at least 1 activity, going backward from this week.
    const weeksMap = new Map<number, boolean>();
    
    activities.forEach(act => {
        const actDate = new Date(act.start_date);
        // Weeks diff from today
        const diff = differenceInWeeks(today, actDate);
        weeksMap.set(diff, true);
    });

    let currentStreak = 0;
    while(weeksMap.get(currentStreak)) {
        currentStreak++;
    }
    // If we missed THIS week but worked out last week, the streak is technically still alive until the week ends.
    if (currentStreak === 0 && weeksMap.get(1)) {
        let tempStreak = 1;
        while(weeksMap.get(tempStreak)) tempStreak++;
        currentStreak = tempStreak; // Streak continues from last week
    }

    // Rough longest streak for the fetched period (90 days)
    let longestStreak = 0;
    let temp = 0;
    for (let i=0; i < 15; i++) { // Max ~12 weeks in 90 days
        if (weeksMap.get(i)) {
            temp++;
            if (temp > longestStreak) longestStreak = temp;
        } else {
            temp = 0;
        }
    }

    return { currentStreak, longestStreak };
  }, [activities, today]);

  // CSS variables for theming levels
  const getLevelClass = (level: number) => {
    if (level === 0) return 'bg-secondary border border-border/50 text-transparent'; // empty
    if (level === 1) return 'bg-orange-950 border border-orange-900 shadow-[0_0_8px_rgba(154,52,18,0.2)] text-orange-900';
    if (level === 2) return 'bg-orange-800 border border-orange-700 shadow-[0_0_12px_rgba(194,65,12,0.4)] text-orange-800';
    if (level === 3) return 'bg-orange-600 border border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.6)] text-orange-600';
    return 'bg-primary border border-primary shadow-[0_0_20px_rgba(252,76,2,0.8)] text-primary'; // level 4
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" /> Training Heatmap
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Review your consistency over the last {weeksToShow} weeks</p>
        </div>
        
        <div className="flex gap-4">
            <div className="flex flex-col bg-background/50 backdrop-blur-md px-4 py-2 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Weekly Streak</span>
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

      <div className="mt-8 flex justify-center md:justify-start overflow-x-auto pb-4 custom-scrollbar relative z-10">
        <div className="flex gap-2 min-w-max">
            {/* Split flat array into 7 rows for standard GitHub style, or keep columns as weeks */}
            {/* Let's render columns as weeks */}
            {Array.from({ length: weeksToShow }).map((_, weekIdx) => {
               const weekDays = calendarData.slice(weekIdx * 7, (weekIdx + 1) * 7);
               return (
                  <div key={weekIdx} className="flex flex-col gap-2">
                      {weekDays.map((day, dayIdx) => (
                          <motion.div
                             key={day.dateStr}
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: (weekIdx * 0.03) + (dayIdx * 0.01), duration: 0.4 }}
                             whileHover={{ scale: 1.2, zIndex: 10 }}
                             onClick={() => day.activities.length > 0 && onSelectActivity(day.activities[0])}
                             className={`w-6 h-6 rounded-md cursor-pointer transition-all duration-200 relative group
                                ${getLevelClass(day.level)} ${day.activities.length === 0 ? 'hover:bg-secondary/80' : 'hover:ring-2 hover:ring-white/50'}
                             `}
                          >
                             {/* Tooltip on hover */}
                             {day.activities.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-xl border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    <p className="font-bold text-primary">{format(day.date, 'MMM do, yyyy')}</p>
                                    <p>{day.activities.length} activity(s)</p>
                                    <p className="text-muted-foreground">{day.totalDistance.toFixed(1)} km total</p>
                                </div>
                             )}
                          </motion.div>
                      ))}
                  </div>
               );
            })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground relative z-10">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`w-4 h-4 rounded-sm ${getLevelClass(l)}`}></div>
          ))}
          <span>More</span>
      </div>
    </div>
  );
}
