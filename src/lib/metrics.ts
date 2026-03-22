import { differenceInDays, parseISO } from 'date-fns';
import { StravaActivity } from '@/services/strava';

export interface DailyMetrics {
  date: string;
  load: number;
  fitness: number;   // CTL
  fatigue: number;   // ATL
  form: number;      // TSB
}

// Fixed max HR for simple estimation (users usually configure this)
const DEFAULT_MAX_HR = 190;
const DEFAULT_REST_HR = 60;

/**
 * Calculates a simplified TRIMP (Training Impulse) based on heart rate or pace.
 */
export function calculateTRIMP(activity: StravaActivity): number {
  if (activity.suffer_score) {
    return activity.suffer_score; // Strava's Suffer Score is a good proxy for TRIMP
  }

  const durationMinutes = activity.moving_time / 60;
  
  // If HR is available, use HR reserve method
  if (activity.average_heartrate) {
    const hrReserve = DEFAULT_MAX_HR - DEFAULT_REST_HR;
    const hrFraction = (activity.average_heartrate - DEFAULT_REST_HR) / hrReserve;
    // Exponential weighting (Banister's TRIMP formula simplified)
    const factor = activity.type === 'Run' ? 1.92 : 1.67; // Slightly higher weight for running
    return durationMinutes * hrFraction * 0.64 * Math.exp(factor * hrFraction);
  }

  // Fallback for no HR: use speed for Run/Ride
  if (activity.type === 'Run') {
    // 5 min/km = 300 sec/km = 3.33 m/s as a roughly "tempo" baseline
    const intensity = activity.average_speed / 3.3; 
    return durationMinutes * intensity * 1.5;
  }

  // Generic fallback if neither HR nor recognizable pace-base
  return durationMinutes * 1.0; 
}

/**
 * Calculates Fitness (CTL), Fatigue (ATL) and Form (TSB) over time.
 * CTL: Exponential moving average of load over 42 days
 * ATL: Exponential moving average of load over 7 days
 * TSB: CTL - ATL
 */
export function calculateFitnessFatigue(activities: StravaActivity[]): DailyMetrics[] {
  // Sort activities chronologically
  const sorted = [...activities].sort((a, b) => 
    parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime()
  );

  if (sorted.length === 0) return [];

  // Group load by day
  const dailyLoadMap = new Map<string, number>();
  sorted.forEach(act => {
    const day = act.start_date.split('T')[0];
    const load = calculateTRIMP(act);
    dailyLoadMap.set(day, (dailyLoadMap.get(day) || 0) + load);
  });

  const firstDate = parseISO(sorted[0].start_date);
  const lastDate = new Date(); // up to today

  const daysDiff = differenceInDays(lastDate, firstDate);
  const metrics: DailyMetrics[] = [];

  let currentFitness = 0;
  let currentFatigue = 0;

  // Smoothing constants
  const ctlConstant = Math.exp(-1 / 42);
  const atlConstant = Math.exp(-1 / 7);

  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(firstDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dayStr = currentDate.toISOString().split('T')[0];

    const todaysLoad = dailyLoadMap.get(dayStr) || 0;

    currentFitness = todaysLoad * (1 - ctlConstant) + currentFitness * ctlConstant;
    currentFatigue = todaysLoad * (1 - atlConstant) + currentFatigue * atlConstant;

    metrics.push({
      date: dayStr,
      load: todaysLoad,
      fitness: Math.round(currentFitness * 10) / 10,
      fatigue: Math.round(currentFatigue * 10) / 10,
      form: Math.round((currentFitness - currentFatigue) * 10) / 10
    });
  }

  return metrics;
}

/**
 * Estimate VO2Max based on running pace and Heart Rate.
 */
export function estimateVO2Max(activities: StravaActivity[]): number | null {
  const runs = activities.filter(a => a.type === 'Run' && a.average_heartrate && a.distance > 3000);
  if (runs.length === 0) return null;

  // Take the most recent relevant runs (up to 5)
  const recentRuns = runs.sort((a, b) => 
    parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()
  ).slice(0, 5);

  let vo2Sum = 0;
  recentRuns.forEach(run => {
    // Speed in vVO2Max estimation: 
    // Roughly: vVO2 (m/min) = Speed(m/s) * 60. VO2 = vVO2 * 0.2 + 3.5
    const speedMMin = run.average_speed * 60;
    const vo2Pace = speedMMin * 0.2 + 3.5;

    // Adjust by HR % (if they did this at 80% HRmax, their true max is higher)
    const hrFraction = run.average_heartrate! / DEFAULT_MAX_HR;
    
    // Very simplified ratio for estimation
    let runVo2 = vo2Pace / Math.max(hrFraction, 0.6);
    vo2Sum += runVo2;
  });

  return Math.round(vo2Sum / recentRuns.length);
}

export function generateInsights(metrics: DailyMetrics[]): string[] {
  if (metrics.length < 7) return ["Keep training to unlock insights."];
  
  const latest = metrics[metrics.length - 1];
  const insights: string[] = [];

  if (latest.form < -20) {
    insights.push("High fatigue alert! Your TSB is very low. Consider taking a rest day to prevent overtraining.");
  } else if (latest.form > 10 && latest.form < 25) {
    insights.push("You are in great form. You are primed for a race or hard effort.");
  } else if (latest.form >= 25) {
    insights.push("Your training load has decreased significantly. You might be losing fitness.");
  }

  // Weekly progress
  const aWeekAgo = metrics[metrics.length - 8];
  if (latest.fitness > aWeekAgo.fitness + 2) {
    insights.push("Solid progression! Your fitness has noticeably increased over the last week.");
  }

  if (insights.length === 0) {
    insights.push("Training is balanced. Keep up the consistent work.");
  }

  return insights;
}
