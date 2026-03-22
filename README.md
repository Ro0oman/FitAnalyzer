# FitAnalyzer Pro 🏃‍♂️⚡

FitAnalyzer is a hyper-modern, stateless web application designed to provide **Pro-level physiological analytics** directly from your Strava data. Inspired by the depth of Runalyze and TrainingPeaks, wrapped in a premium UX reminiscent of Vercel and Stripe.

No databases. No backend data storage. 100% Client-side processing using your local browser and your own Strava tokens.

## ✨ Features (Pro V2)

*   **OAuth 2.0 Stateless Auth**: Direct connection to Strava API. Tokens are stored ephemerally and purely in `localStorage`.
*   **Pro Performance Modeling**: Interactive Recharts-powered graphs featuring Fitness (CTL), Fatigue (ATL), and Form (TSB). Includes zoom controls via Brushes and Phase detection (Base, Build, Peak, Overreaching).
*   **Heatmap Calendar (1 Year View)**: An infinite, horizontal GitHub-style heatmap. 
    *   Smart Icons: Automatically displays footprints for `Runs` and dumbbells for `Cross-Training/Other`.
    *   Detailed tooltips hovering over weekly blocks for mileage summaries.
*   **AI Insights V2**: A rules-engine categorizes your training trends into 🟢 Positive, 🟡 Neutral, and 🔴 Risk (e.g., Warning about aggressive Ramp Rates or excessive TSB drops).
*   **Race Predictor**: Advanced mathematical modeling based on Jack Daniels VDOT and Riegel exponential formulas for 5K, 10K, Half-Marathon, and Marathon.
*   **Activity Modals with Recharts**: Clicking any training session opens an immersive glassmorphic modal with procedural Pace vs HR charts, Elevation plots, and an automatic *Cardiac Drift* (Decoupling) calculation.
*   **Runalyze-Style Weekly Stats**: A beautiful, minimalist table summarizing your last 10 weeks of training load (TRIMP), hours, distance, and Avg HR.
*   **Year in Sport (Strava Wrapped)**: A stunning, `framer-motion` powered "Story" view under `/dashboard/wrapped` to visualize your yearly performance milestones.

## 🚀 Quick Start (Development)

To run this application locally:

1.  **Clone the Repository**
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your Strava Developer API keys:
    ```env
    NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id_numbers
    STRAVA_CLIENT_SECRET=your_client_secret_string
    ```
4.  **Run the local server**:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000)

## 🌐 Production Deployment (Vercel)

When deploying to Vercel, remember that Next.js Server-Side Rendering (SSR) needs to know the absolute Redirect URIs.

1.  Add `NEXT_PUBLIC_STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` in your Vercel Project **Settings -> Environment Variables**.
2.  Add your Vercel domain (e.g., `fitanalyzer.vercel.app`) to your **Strava API Settings** under "Authorization Callback Domain".
3.  Trigger a new **Redeploy** on Vercel so the `NEXT_PUBLIC_` variables get hardcoded into the static build perfectly.

---
Built with Next.js App Router, Tailwind CSS, Zustand, Recharts, and Framer Motion.
