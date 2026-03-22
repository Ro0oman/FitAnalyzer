import { Activity } from "lucide-react";

export default function Home() {
  const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : 'http://localhost:3000/api/auth/callback';
  
  // Scopes required: read profile, read activities (private included)
  const SCOPES = "read,activity:read_all";
  
  const handleLogin = () => {
    // We will build this URL properly with the user later, this is just for presentation if clicked.
    // Given the STATICS, the login URL will be generated from an env variable.
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
            <Activity className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            FitAnalyzer
          </h1>
          <p className="text-lg text-muted-foreground">
            Advance performance analytics, estimated VO2Max, and fitness-fatigue modeling driven by your Strava data.
          </p>
        </div>

        <div className="pt-8">
          {/* Typically we'd use an anchor tag with the Strava OAuth URL here */}
          <a
            href={`https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=${SCOPES}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#fc4c02] px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#e34402] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fc4c02] transition-colors"
          >
            Connect with Strava
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            We don't store your data. All processing is done locally in your browser.
          </p>
        </div>
      </div>
    </main>
  );
}
