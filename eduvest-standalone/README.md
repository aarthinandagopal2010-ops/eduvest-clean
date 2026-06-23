# EduVest — College Affordability Platform

A standalone React + Vite web app for college financial planning.  
No backend, no database — fully client-side with localStorage persistence.

## Features

- **ROI Calculator** — single-college analysis with Financial Health Score (1–100) and salary growth projection
- **College Comparison** — compare up to 5 colleges side-by-side with ranked results and opportunity cost analysis
- **Scholarship Tracker** — CRUD tracker with deadline alerts and status flow (Interested → Applying → Submitted → Won)
- **Financial Literacy Hub** — 6 expandable educational lessons on student loans, interest, budgeting, credit, and compound interest
- **Saved Calculations** — localStorage-persisted history of your ROI calculations

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
npm run preview   # serve locally to verify
```

Output goes to `dist/` — deploy that folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).

## Stack

- **React 19** + TypeScript
- **Vite 7** with `@vitejs/plugin-react`
- **Tailwind CSS v4** with `@tailwindcss/vite`
- **Recharts** for data visualization
- **Lucide React** for icons
- **Poppins** font (Google Fonts)
- **localStorage** for all data persistence (no server required)

## Project Structure

```
eduvest/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── robots.txt
└── src/
    ├── main.tsx
    ├── App.tsx             # Layout + sidebar navigation
    ├── index.css           # Tailwind + lavender theme variables
    ├── lib/
    │   └── calc.ts         # Shared financial calculation helpers
    ├── hooks/
    │   ├── useSavedCalcs.ts     # localStorage hook for saved ROI results
    │   └── useScholarships.ts   # localStorage hook for scholarship tracker
    └── pages/
        ├── Calculator.tsx   # Single-college ROI + health score + charts
        ├── Compare.tsx      # Multi-college comparison + opportunity cost
        ├── Scholarships.tsx # CRUD scholarship tracker with deadline alerts
        ├── Learn.tsx        # Financial literacy hub (6 accordion lessons)
        └── Saved.tsx        # Saved calculations history
```

## Deploying

### Netlify / Vercel / Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- No environment variables required

### GitHub Pages
Add `base: "/your-repo-name/"` to `vite.config.ts` before building.
