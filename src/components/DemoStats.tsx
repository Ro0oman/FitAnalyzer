'use client';

import { Activity, Heart, Navigation, Timer } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

export function DemoStats() {
  const stats = [
    {
      label: "Weekly Distance",
      value: "42.5 km",
      change: "+12%",
      icon: <Navigation className="w-5 h-5 text-blue-500" />,
      description: "Steady progress this week",
      tooltip: "The total distance covered in the last 7 rolling days."
    },
    {
      label: "Training Stress",
      value: "450",
      change: "Optimal",
      icon: <Activity className="w-5 h-5 text-red-500" />,
      description: "Productive training phase",
      tooltip: "A score representing the intensity and duration of your training efforts."
    },
    {
      label: "Avg Heart Rate",
      value: "145 bpm",
      change: "-2 bpm",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      description: "Improved efficiency",
      tooltip: "Your average heart rate across all activities this week."
    },
    {
      label: "Time Spent",
      value: "5h 24m",
      change: "+45m",
      icon: <Timer className="w-5 h-5 text-amber-500" />,
      description: "Higher volume than last week",
      tooltip: "The total moving time spent training this week."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((stat, i) => (
        <div key={i} className="p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-muted">
              {stat.icon}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.change.startsWith('+') || stat.change === 'Optimal' 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {stat.change}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <InfoTooltip title={stat.label} content={stat.tooltip} />
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
