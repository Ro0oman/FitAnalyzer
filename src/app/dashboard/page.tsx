'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchRecentActivities, StravaActivity } from '@/services/strava';
import { calculateFitnessFatigue, DailyMetrics, estimateVO2Max, generateInsights } from '@/lib/metrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, HeartPulse, TrendingUp, AlertTriangle } from 'lucide-react';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { ActivityDetailsModal } from '@/components/ActivityDetailsModal';

export default function Dashboard() {
  const { isAuthenticated, athlete } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [vo2max, setVo2Max] = useState<number | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/');
      return;
    }

    async function loadData() {
      try {
        const rawActivities = await fetchRecentActivities();
        setActivities(rawActivities);

        const dailyMetrics = calculateFitnessFatigue(rawActivities);
        setMetrics(dailyMetrics);

        const estVo2 = estimateVO2Max(rawActivities);
        setVo2Max(estVo2);

        const generatedInsights = generateInsights(dailyMetrics);
        setInsights(generatedInsights);

      } catch (err) {
        console.error(err);
        setError('Failed to load Strava data. Token might be expired.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h2 className="text-xl font-bold">{error}</h2>
        <button onClick={() => router.replace('/')} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold">
          Reconnect with Strava
        </button>
      </div>
    );
  }

  const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : { form: 0, fitness: 0, fatigue: 0 };
  const totalDistance = activities.reduce((acc, a) => acc + (a.distance || 0), 0) / 1000;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="text-sm text-muted-foreground hidden sm:block">
          Athlete: <span className="text-foreground font-medium">{athlete?.firstname} {athlete?.lastname}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Fitness Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Current Fitness (CTL)</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black">{latestMetrics.fitness}</div>
            <p className="text-xs text-muted-foreground mt-1">Form: <span className={latestMetrics.form < 0 ? 'text-destructive' : 'text-green-500'}>{latestMetrics.form > 0 ? '+' : ''}{latestMetrics.form}</span></p>
          </div>
        </div>

        {/* VO2Max Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Est. VO2Max</h3>
            <HeartPulse className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black">{vo2max || '--'}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on recent runs</p>
          </div>
        </div>

        {/* Distance Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">90d Distance</h3>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black">{Math.round(totalDistance)} <span className="text-lg">km</span></div>
            <p className="text-xs text-muted-foreground mt-1">{activities.length} activities logged</p>
          </div>
        </div>
      </div>

      {/* Training Heatmap */}
      <TrainingCalendar activities={activities} onSelectActivity={setSelectedActivity} />

      <ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />

      {/* Main Chart */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <div className="flex flex-col space-y-1.5 mb-6">
          <h3 className="font-semibold leading-none tracking-tight">Performance Modeling</h3>
          <p className="text-sm text-muted-foreground">Fitness (CTL) and Fatigue (ATL) over time.</p>
        </div>
        <div className="h-[350px] w-full">
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#a1a1aa" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#ededed', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="fitness" name="Fitness (CTL)" stroke="#fc4c02" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="fatigue" name="Fatigue (ATL)" stroke="#3b82f6" strokeWidth={2} dot={false} opacity={0.8} />
                <Line type="monotone" dataKey="form" name="Form (TSB)" stroke="#22c55e" strokeWidth={2} dot={false} opacity={0.8} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data to graph.</div>
          )}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" /> AI Insights
          </h3>
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="bg-secondary/50 p-3 rounded-md text-sm leading-relaxed border border-border/50">
                {insight}
              </li>
            ))}
            {insights.length === 0 && <p className="text-sm text-muted-foreground">No insights available.</p>}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h3 className="font-semibold mb-4">Recent Training Block</h3>
          <div className="flex-1 flex items-center justify-center">
             <div className="text-center space-y-2">
               <p className="text-muted-foreground text-sm">Last 7 Days Training Load</p>
               <div className="text-5xl font-black text-primary">
                 {Math.round(metrics.slice(-7).reduce((acc, m) => acc + m.load, 0) || 0)}
               </div>
               <p className="text-xs text-muted-foreground">Target: 400 - 600 TRIMP</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
