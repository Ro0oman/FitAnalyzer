import { StravaActivity } from './strava';

export function generateMockActivities(): StravaActivity[] {
  const activities: StravaActivity[] = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  // Base fitness parameters
  let fitness = 45;
  
  // Last 365 days
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now - i * dayInMs);
    const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Skip some days for rest (Monday and Friday usually)
    if (dayOfWeek === 1 || dayOfWeek === 5) {
      if (Math.random() > 0.2) continue;
    }

    // Determine activity type
    // Weekend: Long Ride or Run
    // Weekday: Interval or Tempo
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const type = Math.random() > 0.4 ? 'Ride' : 'Run';
    
    let distance = 0;
    let duration = 0;
    let elevation = 0;
    let avgHr = 135 + Math.random() * 20;

    if (type === 'Ride') {
      distance = isWeekend ? 60000 + Math.random() * 60000 : 25000 + Math.random() * 20000;
      duration = (distance / 28000) * 3600; // ~28km/h
      elevation = (distance / 1000) * (5 + Math.random() * 15);
    } else {
      distance = isWeekend ? 15000 + Math.random() * 10000 : 7000 + Math.random() * 8000;
      duration = (distance / 11000) * 3600; // ~11km/h
      elevation = (distance / 1000) * (2 + Math.random() * 8);
      avgHr += 10;
    }

    activities.push({
      id: 9000000 + i,
      name: `${isWeekend ? 'Long' : 'Tempo'} ${type} ${i % 7 === 0 ? '🔥' : ''}`,
      distance,
      moving_time: Math.floor(duration),
      elapsed_time: Math.floor(duration * 1.1),
      total_elevation_gain: Math.floor(elevation),
      type,
      sport_type: type,
      start_date: date.toISOString(),
      average_speed: distance / duration,
      max_speed: (distance / duration) * 1.5,
      average_heartrate: Math.floor(avgHr),
      max_heartrate: Math.floor(avgHr + 25),
      suffer_score: Math.floor((duration / 3600) * (avgHr - 120) * 0.8)
    });
  }

  return activities.reverse();
}

export const MOCK_ATHLETE = {
  id: 123456,
  username: 'testathlete',
  firstname: 'Test',
  lastname: 'Athlete',
  profile: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=200&auto=format&fit=crop'
};
