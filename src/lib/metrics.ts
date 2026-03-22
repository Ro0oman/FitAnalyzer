import { differenceInDays, parseISO, differenceInWeeks } from 'date-fns';
import { StravaActivity } from '@/services/strava';

export interface DailyMetrics {
  date: string;
  load: number;
  fitness: number;   // CTL
  fatigue: number;   // ATL
  form: number;      // TSB
  paceMin?: number;  // Avg pace of runs that day (min/km strictly numeric)
  hrAvg?: number;    // Avg HR of the day 
}

export type InsightType = 'positive' | 'neutral' | 'risk';

export interface AIInsight {
  id: string;
  type: InsightType;
  message: string;
  metric?: string;
}

export interface TrainingBalance {
  easyPercent: number;
  hardPercent: number;
  totalActivities: number;
}

export interface RacePredictions {
  fiveK: string;
  tenK: string;
  halfMarathon: string;
  marathon: string;
}

const DEFAULT_MAX_HR = 190;
const DEFAULT_REST_HR = 60;
const EASY_HR_THRESHOLD_PERCENT = 0.78; // 78% of max HR is boundary for "Easy"

export function calculateTRIMP(activity: StravaActivity): number {
  if (activity.suffer_score) return activity.suffer_score;

  const durationMinutes = activity.moving_time / 60;
  
  if (activity.average_heartrate) {
    const hrReserve = DEFAULT_MAX_HR - DEFAULT_REST_HR;
    const hrFraction = (activity.average_heartrate - DEFAULT_REST_HR) / hrReserve;
    const factor = activity.type === 'Run' ? 1.92 : 1.67; 
    return durationMinutes * hrFraction * 0.64 * Math.exp(factor * hrFraction);
  }

  if (activity.type === 'Run') {
    const intensity = activity.average_speed / 3.3; 
    return durationMinutes * intensity * 1.5;
  }

  return durationMinutes * 1.0; 
}

export function calculateFitnessFatigue(activities: StravaActivity[]): DailyMetrics[] {
  const sorted = [...activities].sort((a, b) => 
    parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime()
  );

  if (sorted.length === 0) return [];

  const dailyLoadMap = new Map<string, number>();
  const dailyPaceSum = new Map<string, number>();
  const dailyPaceCount = new Map<string, number>();
  const dailyHrSum = new Map<string, number>();
  const dailyHrCount = new Map<string, number>();

  sorted.forEach(act => {
    const day = act.start_date.split('T')[0];
    const load = calculateTRIMP(act);
    dailyLoadMap.set(day, (dailyLoadMap.get(day) || 0) + load);

    if (act.type === 'Run') {
      const paceVal = (1000 / act.average_speed) / 60; // min/km
      dailyPaceSum.set(day, (dailyPaceSum.get(day) || 0) + paceVal);
      dailyPaceCount.set(day, (dailyPaceCount.get(day) || 0) + 1);
    }

    if (act.average_heartrate) {
       dailyHrSum.set(day, (dailyHrSum.get(day) || 0) + act.average_heartrate);
       dailyHrCount.set(day, (dailyHrCount.get(day) || 0) + 1);
    }
  });

  const firstDate = parseISO(sorted[0].start_date);
  const lastDate = new Date();

  const daysDiff = Math.max(differenceInDays(lastDate, firstDate), 0);
  const metrics: DailyMetrics[] = [];

  let currentFitness = 0;
  let currentFatigue = 0;
  const ctlConstant = Math.exp(-1 / 42);
  const atlConstant = Math.exp(-1 / 7);

  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(firstDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dayStr = currentDate.toISOString().split('T')[0];

    const todaysLoad = dailyLoadMap.get(dayStr) || 0;
    currentFitness = todaysLoad * (1 - ctlConstant) + currentFitness * ctlConstant;
    currentFatigue = todaysLoad * (1 - atlConstant) + currentFatigue * atlConstant;
    
    const pCount = dailyPaceCount.get(dayStr) || 0;
    const hCount = dailyHrCount.get(dayStr) || 0;

    metrics.push({
      date: dayStr,
      load: Math.round(todaysLoad),
      fitness: Math.round(currentFitness * 10) / 10,
      fatigue: Math.round(currentFatigue * 10) / 10,
      form: Math.round((currentFitness - currentFatigue) * 10) / 10,
      paceMin: pCount > 0 ? (dailyPaceSum.get(dayStr)! / pCount) : undefined,
      hrAvg: hCount > 0 ? (dailyHrSum.get(dayStr)! / hCount) : undefined
    });
  }

  return metrics;
}

export function estimateVO2Max(activities: StravaActivity[]): number {
  const runs = activities.filter(a => a.type === 'Run' && a.average_heartrate && a.distance > 3000);
  if (runs.length === 0) return 40; // Default baseline

  const recentRuns = runs.sort((a, b) => 
    parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()
  ).slice(0, 10);

  let vo2Sum = 0;
  let validCount = 0;

  recentRuns.forEach(run => {
    const speedMMin = run.average_speed * 60;
    const vo2Pace = speedMMin * 0.2 + 3.5;
    const hrFraction = run.average_heartrate! / DEFAULT_MAX_HR;
    
    if (hrFraction > 0.5) {
      // Linear scaling of VO2 based on HR reserve used
      const estVo2MaxMatch = vo2Pace / hrFraction;
      vo2Sum += estVo2MaxMatch;
      validCount++;
    }
  });

  return validCount > 0 ? Math.round(vo2Sum / validCount) : 40;
}

export function evaluateTrainingBalance(activities: StravaActivity[]): TrainingBalance {
  let easy = 0;
  let hard = 0;

  activities.forEach(act => {
    if (act.average_heartrate) {
      if (act.average_heartrate / DEFAULT_MAX_HR < EASY_HR_THRESHOLD_PERCENT) {
        easy++;
      } else {
        hard++;
      }
    } else {
      // Guess by suffer score or fallback to easy
      if (act.suffer_score && act.suffer_score > 60) hard++;
      else easy++;
    }
  });

  const total = easy + hard;
  if(total === 0) return { easyPercent: 100, hardPercent: 0, totalActivities: 0 };

  return {
    easyPercent: Math.round((easy / total) * 100),
    hardPercent: Math.round((hard / total) * 100),
    totalActivities: total
  };
}

export function calculateConsistencyScore(activities: StravaActivity[]): number {
  if (activities.length === 0) return 0;
  
  const today = new Date();
  const twelveWeeksAgo = new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  
  const relevantActs = activities.filter(a => parseISO(a.start_date) >= twelveWeeksAgo);
  if (relevantActs.length === 0) return 0;

  const weeklyCounts = new Array(12).fill(0);
  relevantActs.forEach(act => {
    const wDiff = differenceInWeeks(today, parseISO(act.start_date));
    if (wDiff >= 0 && wDiff < 12) {
      weeklyCounts[wDiff]++;
    }
  });

  const activeWeeks = weeklyCounts.filter(c => c > 0).length;
  const consistency = (activeWeeks / 12) * 100;
  return Math.round(consistency);
}

function formatTimePredictor(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.round((minutes % 1) * 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function predictRaceTimes(vo2max: number): RacePredictions {
  // Simplified Riegel-like interpolation based on VO2Max tables (Daniels VDOT)
  // Mapping a generic VO2 to finish times. 
  // Very rough formulas optimized for standard amateur runners using VO2:
  const vdot = vo2max; 
  
  // Cameron's formula or modified Riegel for more realistic times.
  // Base 5k time from VDOT approximation (Jack Daniels table reverse mapping)
  // Simplified math approximation for VDOT to 5k time (minutes):
  // 5k = 2900 / VDOT (very rough) but let's use a smoother polynomial or fixed curve
  // Better approximation: time_5k(min) = 110 - (1.15 * VDOT) ... actually let's use:
  // VDOT 30 ~ 30:40 (30.6min) | VDOT 40 ~ 24:08 (24.1min) | VDOT 50 ~ 19:57 (19.9min) | VDOT 60 ~ 17:03 (17.0min)
  // Fit: 5k_min = 65.5 - 1.15 * VDOT + 0.0055 * VDOT^2
  
  const time5k = Math.max(13, 65.5 - (1.15 * vdot) + (0.0055 * vdot * vdot));
  
  const riegel = (distBase: number, distTarget: number, timeBase: number) => {
      // exponent 1.06 is standard Riegel, but for amateurs 1.08 to 1.10 is more realistic for Marathons.
      const exp = distTarget > 21 ? 1.08 : 1.06;
      return timeBase * Math.pow((distTarget / distBase), exp);
  };

  const time10k = riegel(5, 10, time5k);
  const timeHM = riegel(5, 21.097, time5k);
  const timeM = riegel(5, 42.195, time5k);

  return {
      fiveK: formatTimePredictor(time5k),
      tenK: formatTimePredictor(time10k),
      halfMarathon: formatTimePredictor(timeHM),
      marathon: formatTimePredictor(timeM)
  };
}

export function generateInsightsV2(metrics: DailyMetrics[], balance: TrainingBalance, consistency: number): AIInsight[] {
  const insights: AIInsight[] = [];
  if (metrics.length < 14) {
    insights.push({ id: 'ins1', type: 'neutral', message: 'Keep training to unlock advanced insights.' });
    return insights;
  }
  
  const latest = metrics[metrics.length - 1];
  const aWeekAgo = metrics[metrics.length - 8];

  // 1. Fatigue & Risk Check
  if (latest.fatigue > latest.fitness * 1.3 && latest.fitness > 20) {
    insights.push({ id: 'r1', type: 'risk', message: 'Warning: ATL is significantly higher than CTL. High fatigue risk.', metric: 'Overreaching' });
  } else if (latest.form < -25) {
    insights.push({ id: 'r2', type: 'risk', message: 'High fatigue alert! Your TSB is very low. Take a rest day to prevent overtraining.', metric: 'TSB < -25' });
  }

  // 2. Training Ramp Rate
  const ctlIncrease = latest.fitness - aWeekAgo.fitness;
  if (ctlIncrease > 6) {
    insights.push({ id: 'r3', type: 'risk', message: `Your CTL has spiked +${ctlIncrease.toFixed(1)} in 7 days. This aggressive ramp rate increases injury risk.`, metric: 'Ramp Rate' });
  } else if (ctlIncrease > 2 && ctlIncrease <= 6) {
    insights.push({ id: 'p1', type: 'positive', message: `Solid progression! CTL up +${ctlIncrease.toFixed(1)} this week. Perfect build phase.`, metric: 'Build' });
  }

  // 3. Peak / Taper check
  if (latest.form >= 5 && latest.form <= 15 && latest.fitness > 30) {
    insights.push({ id: 'p2', type: 'positive', message: 'You are in the optimal zone of form. Primed for a race or hard effort!', metric: 'Peak Condition' });
  } else if (latest.form > 20) {
    insights.push({ id: 'n1', type: 'neutral', message: 'Your training load has decreased significantly. You are losing fitness (detraining).', metric: 'TSB > 20' });
  }

  // 4. Polarized Training / Balance
  if (balance.totalActivities >= 5) {
     if (balance.easyPercent < 60) {
         insights.push({ id: 'n2', type: 'neutral', message: `Consider more Zone 2. You are doing ${balance.easyPercent}% Easy, optimal is ~80%.`, metric: 'Polarization' });
     } else if (balance.easyPercent >= 75) {
         insights.push({ id: 'p3', type: 'positive', message: `Great discipline! Your training mix is ${balance.easyPercent}% Easy, minimizing injury risk.`, metric: '80/20 Rule' });
     }
  }

  // 5. Consistency
  if (consistency >= 90) {
      insights.push({ id: 'p4', type: 'positive', message: 'Outstanding consistency! You have worked out almost every week for 3 months.', metric: 'Consistency' });
  }

  if (insights.length === 0) {
    insights.push({ id: 'n3', type: 'neutral', message: 'Training is balanced. Keep up the consistent work.' });
  }

  // Return max 5 highest priority insights
  return insights.sort((a,b) => {
    const rank = { 'risk': 3, 'positive': 2, 'neutral': 1 };
    return rank[b.type] - rank[a.type];
  }).slice(0, 5);
}

export function detectTrainingPhase(latestForm: number, ctlDelta: number): string {
    if (latestForm < -10 && ctlDelta > 0) return 'Build';
    if (latestForm < -20) return 'Overreaching';
    if (latestForm > 5 && ctlDelta < -1) return 'Taper / Peak';
    if (latestForm > 15) return 'Recovery / Detraining';
    return 'Base / Maintenance';
}

export function calculateEfficiencyScore(activity: StravaActivity): number | null {
    if (activity.type !== 'Run' || !activity.average_heartrate || activity.average_heartrate < 50) return null;
    // Speed in m/s divided by heart rate. The higher the better.
    // E.g., 3.33 m/s (5:00 min/km) / 150 bpm = 0.0222
    // Multiply by 1000 for a readable "Efficiency Factor" (EF) metric. EF = 22.2
    return Math.round((activity.average_speed / activity.average_heartrate) * 1000 * 10) / 10;
}
