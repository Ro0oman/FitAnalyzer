'use client';

import { Bike, Flame, Play, Timer, Trophy } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

export function ActivityCards({ onSelect }: { onSelect?: (activity: any) => void }) {
  const activities = [
    {
      id: 1,
      type: "Ride",
      name: "Morning Endurance Loop",
      date: "Today, 8:30 AM",
      distance: "32.4 km",
      time: "1h 12m",
      avgSpeed: "27.0 km/h",
      elevation: "420m",
      relativeEffort: 68,
      avgHeartRate: 142,
      maxHeartRate: 165,
      calories: 840,
      icon: <Bike className="w-5 h-5" />,
      color: "text-blue-500"
    },
    {
      id: 2,
      type: "Run",
      name: "Interval Training",
      date: "Yesterday",
      distance: "8.2 km",
      time: "42m 15s",
      avgPace: "5:09 /km",
      elevation: "45m",
      relativeEffort: 112,
      avgHeartRate: 158,
      maxHeartRate: 182,
      calories: 620,
      icon: <Play className="w-5 h-5 rotate-90" />,
      color: "text-orange-500"
    },
    {
      id: 3,
      type: "Ride",
      name: "Gran Fondo Practice",
      date: "Sunday",
      distance: "105.0 km",
      time: "3h 45m",
      avgSpeed: "28.0 km/h",
      elevation: "1,250m",
      relativeEffort: 245,
      avgHeartRate: 138,
      maxHeartRate: 172,
      calories: 2850,
      icon: <Trophy className="w-5 h-5" />,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Recent Activities</h3>
        <button className="text-xs text-primary font-medium hover:underline">View All</button>
      </div>
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          onClick={() => onSelect?.(activity)}
          className="group p-4 bg-card rounded-xl border border-border shadow-sm hover:border-primary/40 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/5 transition-colors ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold truncate">{activity.name}</h4>
                  <p className="text-xs text-muted-foreground">{activity.date} • {activity.type}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-semibold text-orange-500">
                    <Flame className="w-3 h-3" />
                    {activity.relativeEffort}
                  </div>
                  <div className="flex items-center justify-end">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Relative Effort</p>
                    <InfoTooltip title="Relative Effort" content="A score based on heart rate that tells you how hard you worked compared to your previous activities." />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Distance</p>
                  <p className="text-sm font-semibold">{activity.distance}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Time</p>
                  <p className="text-sm font-semibold">{activity.time}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Elevation</p>
                  <p className="text-sm font-semibold">{activity.elevation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
