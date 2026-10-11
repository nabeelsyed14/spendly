# Spendly

A personal budget tracker for income, expenses, and savings goals. Runs in the browser and on Android. Data is stored in IndexedDB on your device — no account, no server.

## Features

- Income/expense tracking with categories, search, and filters
- Multi-currency — 30+ currencies with symbol formatting
- Health scoring — spending/earning targets scored on a 1-10 scale
- Spending velocity — daily burn rate and month-end projections
- Category breakdowns with trend detection
- Reports — monthly and all-time views with a month picker and day-by-day drill-down
- CSV import/export — on-device parsing, review-before-import, export saved straight to Downloads on Android
- SMS spend tracking (Android) — bank SMS parsed on-device into a review inbox; approve to add
- Dark/light theme with manual toggle
- Avatar customization (gradient picker or photo)
- Installable web app (PWA)
- Android app via Capacitor

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database | Dexie.js (IndexedDB) |
| Routing | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Android | Capacitor 8 |

## Setup

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/nabeelsyed14/spendly.git
cd spendly
npm install
npm run dev
```

**Production build (web):**

```bash
npm run build
npm run preview
```

## Android app

```bash
npm run build:android   # build web assets (no service worker)
npx cap sync android    # copy them into the Android project
```

Then open the `android/` folder in Android Studio and build the APK
(**Build → Build Bundle(s)/APK(s) → Build APK(s)**).

After changing the logo, regenerate the launcher icons:

```bash
npm run icons
```

## Data & privacy

All data is stored in your device's IndexedDB. Nothing is sent to any server, and there is no analytics or tracking.

SMS tracking (Android only, opt-in) reads messages from sender IDs you enable, parses possible spends entirely on-device, and holds them in a local review inbox until you approve or discard them. Messages never leave your phone.

Clearing browser or app data removes all transactions. Data is not synced across devices.

## License

MIT
