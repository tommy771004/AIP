# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Express + Vite middleware) at http://127.0.0.1:3000
npm run build    # vite build frontend + esbuild bundle server.ts → dist/server.cjs
npm start        # run production build
npm run lint     # TypeScript type-check only (tsc --noEmit), no test suite exists
```

## Architecture

**Full-stack single repo**: `server.ts` (Express) runs on port 3000. In dev it mounts Vite as middleware; in prod it serves `dist/` static files.

**Data flow**:
1. `src/api/scraper.ts` — all scraping logic. `getFirContactsPaginated()` calls 11 region-specific scraper functions in parallel via `Promise.all`. Each scraper tries to hit the live eAIP source and falls back to hardcoded cache data on failure.
2. `server.ts` — four REST endpoints (`/api/health`, `/api/contacts`, `/api/regions`, `/api/sources/validate`) call the scraper module.
3. `src/App.tsx` — fetches `/api/contacts` and `/api/sources/validate` on mount, computes derived state client-side via `src/lib/firAnalytics.ts`, passes data down to four tab-based views.

**Scraper pattern**: Every scraper function (`scrapeTaiwanANWS`, `scrapeUKEAip`, etc.) has a try/catch — the catch branch returns hardcoded records with `sourceVerified: false` and `sourceStatus: 'cache'`. `SCRAPER_SOURCES` (keyed by region string) holds the eAIP entry URLs and fallback URLs.

**FIR data model** (`src/types.ts`): The canonical record is `FirContactRecord`. `buildFirClusters` in `firAnalytics.ts` groups records by `firIcao-regionCode` into `FirCluster` objects. `statusTone` is derived: `'hot'` if any facility is RCC type or has 121.5 MHz freq; `'watch'` if any are unverified; `'stable'` otherwise.

**AIRAC cycle**: Computed dynamically in `getCurrentAiracDate()` — epoch 2024-01-25, 28-day rolling cycles. All scraped records stamp this as their `airacCycle`.

**Frontend tabs** (`TabType`): `'sos'` → Dashboard, `'sectors'` → SectorsMap, `'rescue'` → RescueContacts, `'chat'` → stub/WIP. `ActiveCall` is a full-screen overlay, not a tab.

**Path alias**: `@` resolves to project root (set in `vite.config.ts`).

## Domain context

- **FIR** (Flight Information Region): ICAO-defined airspace. 4-letter ICAO codes (e.g. `RCAA` = Taipei FIR). FIR codes differ from airport codes (`RCTP` = Taoyuan airport, not the FIR) — do not conflate them.
- **AFTN**: Aviation Fixed Telecommunications Network — 8-char address used for official ATC comms.
- **eAIP**: Electronic Aeronautical Information Publication — each country's official AIP website; GEN 3.3 section contains ATC contact data.
- **AIRAC**: 28-day aviation data effective date cycle used globally.
- Facility types: ACC (Area Control Centre), ARTCC (US equivalent), RCC (Rescue Coordination Centre), APP (Approach Control), FIC (Flight Information Centre).
