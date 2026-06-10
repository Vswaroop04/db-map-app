# db-map-app

A take-home project for Draftbit. The goal was two screens — a map with location pins and a detail view when you tap one. Rather than just getting that working as fast as possible, I tried to make decisions the way I would for something real: thought about the data flow, the API integration, the cache layer, and the project structure. Not just to deliver two screens but to build them in a way that would be straightforward to extend.

**Live:** https://db-map-app.vswaroop04.workers.dev/

---

## What It Does

- Opens to a map showing famous nearby places pulled from Foursquare via a Supabase cache
- GPS-based — it uses your actual location to query places around you
- Tap any pin to see a detail screen: name, category, address, distance, a mini map, and a directions button
- List tab with category filters if you prefer scrolling over tapping a map
- Works on iOS, Android, and web (Cloudflare Pages)

---

## Stack

- **Expo 54** / React Native 0.81.5
- **Expo Router v6** — file-based navigation
- **NativeWind v4** — Tailwind CSS for React Native
- **react-native-maps** — native map on iOS/Android
- **Leaflet** — web fallback map (dynamically imported, not in the native bundle)
- **Zustand** — state for places, GPS, filters, and active pin
- **Supabase** — PostgreSQL cache layer with auto-generated REST API
- **Foursquare Places API** — source of truth for location data
- **Cloudflare Pages** — web deployment

---

## Architecture

### Data Flow

```
Foursquare API → seed script → Supabase → Expo app → Cloudflare Pages
```

Hitting Foursquare on every app open would be bad — rate limits, latency, and if Foursquare goes down the app breaks. So I used Supabase as a persistent cache. A seed script runs once, pulls famous landmarks from Foursquare for a given city, and upserts them into Supabase using `external_id` to avoid duplicates. The app then queries Supabase directly on open. If Supabase has nothing nearby it falls back to Foursquare live — but only on native, because Foursquare blocks browser requests (CORS).

### Why Foursquare

I tested Foursquare and OpenStreetMap side by side. OpenStreetMap's Nominatim searched for "landmark" and returned places literally named Landmark — a restaurant, a hotel, an apartment building. Lat/lon came back as strings not numbers, categories were raw OSM tags like `amenity` and `tourism`, nothing human-readable. Wrong tool — it's a geocoding API not a POI discovery API.

Foursquare returned actual famous places. Lat/lng as numbers at the top level, clean category names, no parsing work to fit my schema. Easy free tier, no billing required.

### Why Supabase

Considered plain JSON on Cloudflare (no real DB), Firebase (overkill, verbose SDK), and a custom Express API (means hosting a backend just to serve 10 rows). Went with Supabase because it has a real Postgres database, auto-generated REST so I didn't have to write any backend endpoints, and a clean JS client that works in both the seed script and the app. Also relevant — Supabase is specifically called out in the Draftbit role description.

### Why platform-specific map files

`react-native-maps` doesn't render in a browser. Rather than a single file full of `Platform.OS` checks, I split the map into `MapRenderer.tsx` (native) and `MapRenderer.web.tsx` (web). Metro and the web bundler each pick the right file automatically. Same props contract, different rendering logic. Same pattern for the detail screen mini-map.

---

## Database Schema

```
id            uuid primary key
external_id   text unique        -- Foursquare place ID, deduplication key
source        text               -- "foursquare" (future-proof if a second source is added)
name          text
latitude      float8
longitude     float8
category      text
address       text
city          text
country       text
description   text               -- filled manually, Foursquare free tier doesn't return this
image_url     text               -- filled manually, same reason
raw_data      jsonb              -- full Foursquare response, kept so new fields don't need a re-fetch
```

Normalize what you know you need, keep the rest in jsonb. The `external_id` + `source` pair together avoids collisions if a second data source is added later.

---

## Issues Faced

### NativeWind className TypeScript errors

NativeWind v4 depends on `react-native-css-interop` for its types but installing it at the root fails — `react-native-css-interop` v0.2.5 requires React Native 0.83–0.86 and Expo 54 ships with 0.81.5. NativeWind bundles its own copy internally. Fixed by augmenting the React Native module types in `nativewind-env.d.ts` to add `className` as an optional prop on the components that need it.

### NativeWind runtime module conflicts

Three errors in sequence, all the same root cause: NativeWind v4.2.1 bundles its own copies of `react-native-css-interop`, `react-native`, and `react` inside its own `node_modules`, and Metro was picking those up instead of the root versions.

1. `Unable to resolve module react-native-css-interop/jsx-runtime` — fixed with an `extraNodeModules` redirect in `metro.config.js` pointing to the copy inside NativeWind's node_modules
2. `Unable to determine event arguments for "onModeChange"` — NativeWind's bundled RN is a newer version the native layer didn't know about. Fixed by adding it to Metro's `blockList`
3. `Invalid hook call` — two copies of React in the bundle. Fixed by also blocking NativeWind's bundled react

End result: one `extraNodeModules` redirect and two `blockList` entries, all forcing Metro back to the single root copies.

### CORS on web for Foursquare

Foursquare blocks browser requests. The store's `fetchNearby` wraps the Foursquare call in `Platform.OS !== 'web'` — web reads from Supabase only.

### react-native-maps bundled on web

The detail screen originally imported MapView directly. The web bundler pulled in `react-native-maps` and crashed. Fixed by extracting `MiniMap.tsx` (native) and `MiniMap.web.tsx` (web) so the native map never reaches the web bundle.

### iOS custom marker jump to top-left on tap

Two causes happening at the same time: a `Callout` component was changing the marker's measured height when it appeared/disappeared, and calling `setActiveId` in the press handler was triggering a re-render that resized the pin. Fixed by removing the Callout entirely, removing `setActiveId` from the press handler, and using a fixed `56×56` outer container so the marker anchor never changes regardless of state.

### iOS markers not visible

`tracksViewChanges={false}` from the start prevents iOS from measuring and rendering the custom view. Fixed by starting it `true` and setting it to `false` after 500ms once the view has been laid out.

### Metro scanning seed folder

NativeWind looks for `tailwind.config` relative to every folder Watchman watches. The `seed/` directory has its own `package.json` which triggered this. Fixed with `blockList` entries in `metro.config.js` and a `.watchmanconfig` that tells Watchman to ignore `seed/`, `seed-script/`, and `api-tests/`.

---

## Setup

1. Clone the repo and run `npm install` from the root
2. Copy `.env.example` to `.env.local` and fill in `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_FOURSQUARE_API_KEY`
3. Run `cd seed && npm install && npm run seed` to seed Supabase with nearby places for a default city
4. From the root: `npx expo start`

For web: `npx expo export -p web` then deploy the `dist/` folder to Cloudflare Pages.

---

## Known Limitations

- Supabase free tier pauses after 1 week of inactivity — if the deployed link looks broken just unpause from the Supabase dashboard
- `description` and `image_url` were added manually after seeding — Foursquare free tier doesn't return them
- Foursquare is native-only due to CORS — web users see whatever is already in Supabase for their area
