# ⚡ VV Hotspots

> **Cyberpunk social discovery platform for the Vasai-Virar region.**

VV Hotspots is a real-time application that allows users to explore, check into, and review popular hangout spots. Built with a distinctive **neon-noir aesthetic**, it combines modern web technologies with real-time social features.

---

## 🚀 Key Features

* **Interactive Neon Maps**: Custom Leaflet implementation with glow-effect markers categorized by venue type.
* **Real-time Activity**: Live feed of user check-ins powered by Supabase Realtime subscriptions.
* **Social Proof**: 5-star rating system and text reviews for local cafes, parks, and gaming zones.
* **Cyberpunk UI**: High-contrast dark mode with neon yellow (`#FFFF00`) and lime accents.
* **Mobile-First**: Fully responsive three-column desktop layout that collapses into a bottom-drawer navigation for mobile users.
* **Advanced Security**: Client-side input sanitization, XSS prevention, and rate-limiting for social actions.

---

## 📂 Project Structure

```text
vv-hotspots/
├── app/                    # Next.js 15 App Router
│   ├── (main)/             # Main application shell (Dashboard, Profile, Settings)
│   ├── actions/            # Server Actions for mutations (Reviews, Friends, Photos)
│   ├── api/                # Route Handlers (Notifications, Cloudinary signing)
│   ├── auth/               # Supabase Auth flow (Login, Sign-up, Callback)
│   └── globals.css         # Tailwind 4 global styles & neon variables
├── components/             # React Component Library
│   ├── ui/                 # Atomic shadcn/ui components (CyberButton, CyberCard)
│   ├── skeletons/          # Loading states for hotspots and galleries
│   ├── map-view.tsx        # Leaflet Map engine
│   └── activity-feed.tsx   # Real-time subscription component
├── context/                # Global React Context (App state)
├── lib/                    # Business Logic & Config
│   ├── supabase/           # Client, Server, and Proxy initializers
│   ├── security.ts         # Sanitization & Rate limiting logic
│   └── types.ts            # Centralized TypeScript interfaces
├── public/                 # Static assets (Map icons, Hotspot images)
├── scripts/                # SQL Migration & Seeding scripts
└── verification/           # Automated UI testing scripts (Python/Playwright)

```

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Database & Auth**: Supabase (PostgreSQL + GoTrue)
* **Real-time**: Supabase Realtime
* **Maps**: React-Leaflet
* **Styling**: Tailwind CSS 4 + Shadcn/UI
* **Storage**: Cloudinary (via `next-cloudinary`)
* **State Management**: TanStack Query (React Query)

---

## 💻 Getting Started

### Prerequisites

* Node.js 18+
* Supabase Account
* Cloudinary Account (for photo uploads)

### Installation

1. **Clone & Install**
```bash
git clone https://github.com/dhruv63/vv-hotspots.git
cd vv-hotspots
npm install

```


2. **Environment Setup**
Create a `.env.local` file based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

```


3. **Database Migration**
Execute the scripts in `/scripts` in numerical order within your Supabase SQL Editor to set up tables, RLS policies, and seed data.
4. **Launch**
```bash
npm run dev

```



---

## 🛡️ Security & Performance

* **RLS (Row Level Security)**: Every table has strict policies ensuring users can only modify their own profiles, check-ins, and ratings.
* **Rate Limiting**: Integrated protection against spamming check-ins (max 10/min) and ratings (max 20/min).
* **PWA Ready**: Service worker integration for offline detection and push notifications.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
