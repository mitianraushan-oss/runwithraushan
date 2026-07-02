# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on **port 3000** (not the Vite default 5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint (React + Hooks rules); `--max-warnings 0`, so warnings fail too

There is **no test script** and no Prettier/Biome formatter. Don't assume those exist.

## Stack & structure

React 18 + Vite 4 + Tailwind CSS 3, plain **JavaScript/JSX (no TypeScript)**, npm. Single-page app, not a monorepo. Nearly all UI lives in `src/App.jsx`; `src/main.jsx` renders it and `src/index.css` holds Tailwind directives + a global reset.

## Stats pipeline

Homepage stats = **MapMyRun baseline + live Strava delta**:

- Baseline: `npm run stats` parses a MapMyRun CSV export (`data/workout_history.csv`, gitignored) into `src/data/stats.json` (committed).
- Live delta: `api/strava.js` is a Vercel serverless function that aggregates Strava activities recorded after the baseline's `lastUpdated` date. The client fetches `/api/strava?after=<date>` on load and merges via `mergeStats` in `App.jsx`; if the fetch fails (e.g. plain `npm run dev`, which has no `/api`), the baseline renders alone. Use `vercel dev` to exercise the function locally.
- It needs `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` / `STRAVA_REFRESH_TOKEN` env vars; obtain the refresh token once with `scripts/strava-auth.mjs`.

## Conventions

- **No React Router.** Navigation is state-driven via tabs (`useState` in `App.jsx`) — add pages as conditional render branches, not routes.
- Functional components with hooks only.
- Style with Tailwind utilities. The theme extends a custom **orange** palette in `tailwind.config.js` — reuse those tokens rather than hardcoding hex colors.
- Icons come from `lucide-react`.

## Deployment & secrets

- Deploys via **Vercel** (project is linked in `.vercel/`). No GitHub Actions CI.
- Donation flow uses **Razorpay and PayPal** links. Any keys belong in `.env` / `.env.local` (both gitignored) — never commit secrets.
