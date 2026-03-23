'use client';

import { Activity, Heart, TrendingUp, Zap, Target, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

export function DetailedAnalysis({ metrics, consistency, balance }: { metrics: any[]; consistency: number; balance: any }) {
  const latest = metrics.length > 0 ? metrics[metrics.length - 1] : { fitness: 0, fatigue: 0, form: 0 };
  
  // Logic for detailed feedback
  const getStatusText = () => {
    if (latest.form > 10) return "Fresh & Ready to Peak";
    if (latest.form < -20) return "Overreaching / High Fatigue";
    if (latest.form >= -15 && latest.form <= 5) return "Productive Building";
    return "Balanced Training";
  };

  const getStatusColor = () => {
    if (latest.form > 10) return "text-emerald-500";
    if (latest.form < -20) return "text-destructive";
    if (latest.form >= -15 && latest.form <= 5) return "text-primary";
    return "text-blue-500";
  };

  const advicePoints = [
    {
      title: "Fitness Progression",
      content: latest.fitness > 40 
        ? "Your Chronic Training Load (CTL) is high. You have a solid aerobic base to support high-intensity efforts."
        : "Your fitness base is building. Focus on consistency over intensity to raise your CTL without injury.",
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      title: "Fatigue Management",
      content: latest.form < -20
        ? "CAUTION: Your form (TSB) is very low. High risk of overtraining. Consider 2-3 recovery days immediately."
        : "Your fatigue is well-managed. You have room for 1-2 key sessions this week to drive fitness gains.",
      icon: <Activity className="w-4 h-4" />
    },
    {
      title: "Intensity Distribution",
      content: balance?.easyPercent > 70
        ? "EXCELLENT: You are following the 80/20 rule well. Your polarized distribution will maximize long-term gains."
        : "ADVICE: You're spending too much time in the 'middle zone'. Try making your easy days slower to recover better.",
      icon: <Target className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-8 p-8 bg-card rounded-3xl border border-border shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <TrendingUp className="w-64 h-64" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            Pro Analysis
          </div>
          <h2 className="text-3xl font-bold">Training Status: <span className={getStatusColor()}>{getStatusText()}</span></h2>
          <p className="text-muted-foreground max-w-xl italic">
            Based on your last 30 days of data, here is an in-depth analysis of your current physiological state and recommended focus areas.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="p-4 bg-muted/50 rounded-2xl text-center min-w-[100px]">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter mb-1">Consistency</p>
            <p className="text-2xl font-bold text-primary">{consistency}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {advicePoints.map((point, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-muted/20 rounded-2xl border border-border/50 space-y-4 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-2 text-primary font-bold">
              {point.icon}
              <h4 className="text-sm uppercase tracking-wider">{point.title}</h4>
            </div>
            <p className="text-sm text-balance leading-relaxed">
              {point.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-6 bg-primary/5 rounded-2xl border border-primary/20">
        <h4 className="font-bold flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" /> Roadmap to Improvement
        </h4>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
            <p className="text-sm">Maintain your current weekend long-duration intensity to stabilize aerobic capacity.</p>
          </div>
          <div className="flex gap-3">
            <div className="mt-1"><Info className="w-4 h-4 text-primary" /></div>
            <p className="text-sm">Introduce one session of 40/20 intervals next week to improve top-end metabolic efficiency.</p>
          </div>
          <div className="flex gap-3">
            <div className="mt-1"><AlertCircle className="w-4 h-4 text-amber-500" /></div>
            <p className="text-sm">Monitor resting heart rate over the next 3 days; if it spikes {'>'}5bpm above baseline, reduce volume by 30%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
