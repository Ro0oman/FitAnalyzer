'use client';

import { StravaActivity } from '@/services/strava';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, MapPin, Clock, ArrowUpRight, HeartPulse } from 'lucide-react';

interface ActivityDetailsModalProps {
  activity: StravaActivity | null;
  onClose: () => void;
}

export function ActivityDetailsModal({ activity, onClose }: ActivityDetailsModalProps) {
  if (!activity) return null;

  const distanceKm = (activity.distance / 1000).toFixed(2);
  const timeMinutes = Math.floor(activity.moving_time / 60);
  const timeSeconds = activity.moving_time % 60;
  const paceSecPerKm = activity.moving_time / (activity.distance / 1000);
  const paceMin = Math.floor(paceSecPerKm / 60);
  const paceSec = Math.floor(paceSecPerKm % 60).toString().padStart(2, '0');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           transition={{ duration: 0.2 }}
           className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Header Map Placeholder / Cover */}
          <div className="h-40 w-full bg-gradient-to-br from-primary/80 to-primary/20 relative p-6 flex flex-col justify-end">
             {/* Map pattern overlay */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
             
             <button 
               onClick={onClose}
               className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
             >
               <X className="w-5 h-5" />
             </button>
             
             <div className="relative z-10 text-white">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{activity.type}</span>
                <h2 className="text-2xl font-black truncate">{activity.name}</h2>
             </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4" />
              {format(new Date(activity.start_date), 'EEEE, MMMM do yyyy - h:mm a')}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
               
               <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                     <MapPin className="w-4 h-4 text-primary" />
                     <span className="text-xs font-semibold uppercase">Distance</span>
                  </div>
                  <div className="text-2xl font-black">{distanceKm} <span className="text-sm font-normal text-muted-foreground">km</span></div>
               </div>
               
               <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                     <Clock className="w-4 h-4 text-blue-500" />
                     <span className="text-xs font-semibold uppercase">Time</span>
                  </div>
                  <div className="text-2xl font-black">{timeMinutes}m {timeSeconds}s</div>
               </div>

               <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                     <Activity className="w-4 h-4 text-emerald-500" />
                     <span className="text-xs font-semibold uppercase">Pace</span>
                  </div>
                  <div className="text-2xl font-black">{paceMin}:{paceSec} <span className="text-sm font-normal text-muted-foreground">/km</span></div>
               </div>
               
               <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                     <ArrowUpRight className="w-4 h-4 text-orange-500" />
                     <span className="text-xs font-semibold uppercase">Elevation</span>
                  </div>
                  <div className="text-2xl font-black">{activity.total_elevation_gain} <span className="text-sm font-normal text-muted-foreground">m</span></div>
               </div>

               {activity.average_heartrate && (
                  <div className="bg-secondary/50 p-4 rounded-xl border border-border col-span-2 flex justify-between items-center">
                     <div>
                         <div className="flex items-center gap-2 text-red-500 mb-1">
                            <HeartPulse className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase">Avg Heart Rate</span>
                         </div>
                         <div className="text-2xl font-black">{Math.round(activity.average_heartrate)} <span className="text-sm font-normal text-muted-foreground">bpm</span></div>
                     </div>
                     {activity.max_heartrate && (
                       <div className="text-right">
                         <span className="text-xs font-semibold uppercase text-muted-foreground">Max HR</span>
                         <div className="text-lg font-bold">{Math.round(activity.max_heartrate)}</div>
                       </div>
                     )}
                  </div>
               )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
