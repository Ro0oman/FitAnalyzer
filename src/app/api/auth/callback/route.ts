import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${error}`);
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code:', data);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }

    // Since we are stateless, we don't save the data to a DB. 
    // We need to pass this safely to the client.
    // The most secure stateless way in Next.js without a backend DB is to set an HttpOnly cookie
    // or pass it via URL hash (which doesn't hit server logs and JS can read it).
    // Given the constraints: we use localStorage in frontend via Zustand.
    // We will redirect to a special page /auth/success#data=... where JS picks it up and clears it.
    
    // Create a base64 encoded payload to attach to the hash
    const payload = Buffer.from(JSON.stringify({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athlete: data.athlete
    })).toString('base64');

    return NextResponse.redirect(`${origin}/auth/success#payload=${payload}`);

  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.redirect(`${origin}/?error=server_error`);
  }
}
