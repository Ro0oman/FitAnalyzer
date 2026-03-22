'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchRecentActivities, StravaActivity } from '@/services/strava';
import { 
  calculateFitnessFatigue, DailyMetrics, estimateVO2Max, generateInsightsV2, 
  evaluateTrainingBalance, calculateConsistencyScore, predictRaceTimes, detectTrainingPhase,
  AIInsight, TrainingBalance, RacePredictions
} from '@/lib/metrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Brush, ReferenceLine } from 'recharts';
import { Activity, HeartPulse, TrendingUp, AlertTriangle, Target, CheckCircle2, AlertCircle, Info, Watch } from 'lucide-react';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { ActivityDetailsModal } from '@/components/ActivityDetailsModal';
import { TrainingStatsTable } from '@/components/TrainingStatsTable';
import { WeeklyComparisonChart } from '@/components/WeeklyComparisonChart';

export default function Dashboard() {
  const { isAuthenticated, athlete } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [vo2max, setVo2Max] = useState<number | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [balance, setBalance] = useState<TrainingBalance | null>(null);
  const [consistency, setConsistency] = useState<number>(0);
  const [predictions, setPredictions] = useState<RacePredictions | null>(null);
  const [phase, setPhase] = useState<string>('Base');
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);

  // Chart Toggles
  const [showCTL, setShowCTL] = useState(true);
  const [showATL, setShowATL] = useState(true);
  const [showTSB, setShowTSB] = useState(true);

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

        const tBalance = evaluateTrainingBalance(rawActivities);
        setBalance(tBalance);

        const consist = calculateConsistencyScore(rawActivities);
        setConsistency(consist);

        const generatedInsights = generateInsightsV2(dailyMetrics, tBalance, consist);
        setInsights(generatedInsights);
        
        const preds = predictRaceTimes(estVo2);
        setPredictions(preds);

        if (dailyMetrics.length > 7) {
            const latest = dailyMetrics[dailyMetrics.length - 1];
            const ago = dailyMetrics[dailyMetrics.length - 8];
            setPhase(detectTrainingPhase(latest.form, latest.fitness - ago.fitness));
        }

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
  const getInsightIcon = (type: string) => {
    if (type === 'positive') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === 'risk') return <AlertCircle className="w-4 h-4 text-destructive" />;
    return <Info className="w-4 h-4 text-amber-500" />;
  };

  const getInsightClass = (type: string) => {
    if (type === 'positive') return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-100';
    if (type === 'risk') return 'border-destructive/30 bg-destructive/5 text-red-100';
    return 'border-amber-500/30 bg-amber-500/5 text-amber-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview <span className="text-primary tracking-normal text-sm font-black ml-2 px-2 py-0.5 rounded-full border border-primary/50 bg-primary/10">PRO</span></h1>
        <div className="text-sm text-muted-foreground hidden sm:block">
          Athlete: <span className="text-foreground font-medium">{athlete?.firstname} {athlete?.lastname}</span>
        </div>
      </div>

      {/* Pro Stats Row Container */}
      <div className="grid gap-4 md:grid-cols-4">
        
        {/* Phase Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Training Phase</h3>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-primary truncate">{phase}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on ATL/CTL balance</p>
          </div>
        </div>

        {/* Fitness Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Fitness (CTL)</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black">{latestMetrics.fitness}</div>
            <p className="text-xs text-muted-foreground mt-1">Form: <span className={latestMetrics.form < 0 ? 'text-destructive' : 'text-green-500'}>{latestMetrics.form > 0 ? '+' : ''}{latestMetrics.form}</span></p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium">Training Balance</h3>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
             <div className="flex-1 w-full bg-secondary h-2 rounded-full overflow-hidden flex">
                 <div style={{ width: `${balance?.easyPercent}%` }} className="bg-emerald-500 h-full"></div>
                 <div style={{ width: `${balance?.hardPercent}%` }} className="bg-destructive h-full"></div>
             </div>
             <div className="text-sm font-bold">{balance?.easyPercent}% <span className="font-normal text-muted-foreground">Easy</span></div>
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
            <p className="text-xs text-muted-foreground mt-1">VDOT Approximate</p>
          </div>
        </div>

      </div>

      {/* Advanced Performance Modeling */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
                 <h3 className="font-semibold leading-none tracking-tight">Pro Performance Modeling</h3>
                 <p className="text-sm text-muted-foreground mt-1 text-balance">Track ATL, CTL, and TSB values with interactive brush.</p>
            </div>
            {/* Toggles */}
            <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg">
                 <button onClick={() => setShowCTL(!showCTL)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${showCTL ? 'bg-[#fc4c02] text-white shadow-md' : 'text-muted-foreground'}`}>CTL</button>
                 <button onClick={() => setShowATL(!showATL)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${showATL ? 'bg-[#3b82f6] text-white shadow-md' : 'text-muted-foreground'}`}>ATL</button>
                 <button onClick={() => setShowTSB(!showTSB)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${showTSB ? 'bg-[#22c55e] text-white shadow-md' : 'text-muted-foreground'}`}>TSB</button>
            </div>
        </div>

        <div className="h-[400px] w-full">
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
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', borderColor: '#fc4c02', color: '#ededed', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontWeight: 'bold' }}
                />
                
                {/* Horizontal reference for Freshness (0 TSB) */}
                {showTSB && <ReferenceLine y={0} stroke="#a1a1aa" strokeDasharray="3 3" opacity={0.5} />}
                
                {showCTL && <Line type="monotone" dataKey="fitness" name="Fitness (CTL)" stroke="#fc4c02" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />}
                {showATL && <Line type="monotone" dataKey="fatigue" name="Fatigue (ATL)" stroke="#3b82f6" strokeWidth={1.5} dot={false} opacity={0.6} />}
                {showTSB && <Line type="monotone" dataKey="form" name="Form (TSB)" stroke="#22c55e" strokeWidth={2} dot={false} opacity={0.9} />}
                
                <Brush 
                   dataKey="date" 
                   height={30} 
                   stroke="#fc4c02" 
                   fill="transparent"
                   tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data to graph.</div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Race Predictor */}
         <div className="rounded-xl border border-border bg-card p-6 shadow-sm col-span-1">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Watch className="w-5 h-5 text-primary" /> Race Predictor
             </h3>
             <div className="space-y-4 pt-2">
                 <div className="flex justify-between items-center pb-2 border-b border-border">
                     <span className="text-muted-foreground text-sm">5k</span>
                     <span className="font-bold">{predictions?.fiveK}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-border">
                     <span className="text-muted-foreground text-sm">10k</span>
                     <span className="font-bold">{predictions?.tenK}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-border">
                     <span className="text-muted-foreground text-sm">Half Marathon</span>
                     <span className="font-bold">{predictions?.halfMarathon}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-muted-foreground text-sm">Marathon</span>
                     <span className="font-bold">{predictions?.marathon}</span>
                 </div>
             </div>
         </div>

        {/* AI Insights Pro */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm col-span-2">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <HeartPulse className="w-5 h-5 text-primary" /> AI Insights Pro Let
          </h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg flex items-start gap-3 border ${getInsightClass(insight.type)}`}>
                 <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                 <div>
                    {insight.metric && <span className="text-xs font-bold uppercase tracking-wider mb-1 block opacity-70">{insight.metric}</span>}
                    <p className="text-sm leading-relaxed">{insight.message}</p>
                 </div>
              </div>
            ))}
            {insights.length === 0 && <p className="text-sm text-muted-foreground">Generating insights...</p>}
          </div>
        </div>
      </div>

      {/* Calendar, Bar Charts, Stats Table and Modals */}
      <TrainingCalendar activities={activities} onSelectActivity={setSelectedActivity} />
      <WeeklyComparisonChart activities={activities} />
      <TrainingStatsTable activities={activities} />
      
      <ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
    </div>
  );
}
