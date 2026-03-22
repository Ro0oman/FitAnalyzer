import { useAuthStore } from '@/store/authStore';

const BASE_URL = 'https://www.strava.com/api/v3';

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
}

// Fetch activities from the last 90 days
export async function fetchRecentActivities(): Promise<StravaActivity[]> {
  const { accessToken } = useAuthStore.getState();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  // 90 days ago in seconds format
  const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
  
  const response = await fetch(`${BASE_URL}/athlete/activities?after=${ninetyDaysAgo}&per_page=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  return response.json();
}

export async function fetchAthleteProfile() {
  const { accessToken } = useAuthStore.getState();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${BASE_URL}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}
