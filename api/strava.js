/**
 * Vercel serverless function: GET /api/strava?after=YYYY-MM-DD
 *
 * Aggregates Strava activities recorded after the given date so the client
 * can add them on top of the MapMyRun baseline in src/data/stats.json.
 * The client owns the baseline and the merge; this function only reports
 * the delta, so it never needs to read files at runtime.
 *
 * Requires env vars (Vercel project settings, or .env.local for `vercel dev`):
 *   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
 * Get the refresh token once via scripts/strava-auth.mjs.
 */

// Map Strava sport types onto the MapMyRun labels used in stats.json.
const TYPE_LABELS = {
  Run: 'Run',
  TrailRun: 'Run',
  VirtualRun: 'Run',
  Walk: 'Walk',
  Hike: 'Walk',
  Ride: 'Bike Ride',
  VirtualRide: 'Bike Ride',
  MountainBikeRide: 'Bike Ride',
  GravelRide: 'Bike Ride',
  EBikeRide: 'Bike Ride',
  Swim: 'Swim',
};

// Strava's activity list carries no step counts, so the "Steps Taken" tile
// is kept moving with a distance-based estimate for foot activities.
const STEPS_PER_KM = { Run: 1150, Walk: 1350 };

async function getAccessToken() {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed (${res.status})`);
  return (await res.json()).access_token;
}

async function fetchActivitiesAfter(epochSeconds, token) {
  const activities = [];
  // 200 per page; a few pages is plenty for "since the last CSV export".
  for (let page = 1; page <= 10; page++) {
    const url =
      `https://www.strava.com/api/v3/athlete/activities` +
      `?after=${epochSeconds}&per_page=200&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Strava activities fetch failed (${res.status})`);
    const batch = await res.json();
    activities.push(...batch);
    if (batch.length < 200) break;
  }
  return activities;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    res.status(503).json({ error: 'Strava credentials not configured' });
    return;
  }

  const after = String(req.query?.after || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(after)) {
    res.status(400).json({ error: 'after must be YYYY-MM-DD' });
    return;
  }

  try {
    // The baseline CSV already covers its export day, so start the delta at
    // the following midnight to avoid double-counting that day's workouts.
    const epoch = Math.floor(Date.parse(`${after}T00:00:00Z`) / 1000) + 24 * 3600;
    const token = await getAccessToken();
    const activities = await fetchActivitiesAfter(epoch, token);

    let distanceKm = 0;
    let seconds = 0;
    let steps = 0;
    const byType = {};
    let longestRunKm = 0;
    let longestRunDate = null;

    for (const a of activities) {
      const label = TYPE_LABELS[a.sport_type || a.type] || a.sport_type || a.type;
      const km = (a.distance || 0) / 1000;
      distanceKm += km;
      seconds += a.moving_time || 0;
      steps += Math.round((STEPS_PER_KM[label] || 0) * km);
      byType[label] = (byType[label] || 0) + 1;
      if (label === 'Run' && km > longestRunKm) {
        longestRunKm = km;
        longestRunDate = a.start_date_local || a.start_date || null;
      }
    }

    // Fresh for 6h at the CDN edge, then revalidated in the background.
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({
      after,
      lastUpdated: new Date().toISOString().slice(0, 10),
      workouts: activities.length,
      distanceKm: Math.round(distanceKm * 10) / 10,
      seconds,
      steps,
      byType,
      longestRunKm: Math.round(longestRunKm * 10) / 10,
      longestRunDate,
    });
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) });
  }
}
