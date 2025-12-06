# VV Hotspots

> A cyberpunk social discovery platform for Vasai-Virar

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

## Overview

VV Hotspots is a real-time social discovery platform that helps users explore and check into popular hangout spots in the Vasai-Virar region. Featuring a distinctive cyberpunk aesthetic with neon colors and glowing effects, the app provides an engaging way to discover cafes, parks, gaming zones, food spots, and hangout locations.

## Features

- **Interactive Map** - Leaflet-powered map with category-colored neon markers
- **Real-time Check-ins** - Live activity feed showing who's checked in where
- **5-Star Ratings & Reviews** - Rate and review your favorite spots
- **User Profiles** - Track your check-in history and ratings
- **Mobile-First Design** - Fully responsive with bottom drawer navigation
- **Cyberpunk Theme** - Neon glows, dark backgrounds, and futuristic styling
- **Offline Detection** - Graceful handling of connectivity issues
- **Rate Limiting** - Built-in spam prevention for check-ins and ratings

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime Subscriptions |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet + React-Leaflet |
| UI Components | shadcn/ui |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/vv-hotspots.git
   cd vv-hotspots
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Required variables:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

4. **Set up the database**
   
   Run the SQL scripts in order from the `scripts/` folder:
   \`\`\`
   001_create_tables.sql      - Creates tables with RLS policies
   002_create_profile_trigger.sql - Auto-creates profile on signup
   003_seed_hotspots.sql      - Seeds initial hotspot data
   004_update_hotspot_images.sql - Updates hotspot images
   005_add_real_hotspots.sql  - Adds real Vasai-Virar locations
   006_add_review_column.sql  - Adds review text to ratings
   007_verify_rls.sql         - Verifies RLS policies
   008_create_hotspot_photos.sql - Creates table for hotspot photos
   009_hotspot_photos_rls.sql - Applies RLS policies for hotspot photos
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Ensure these are set in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Project Structure

\`\`\`
vv-hotspots/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main app dashboard
│   └── profile/           # User profile page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Feature components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   ├── security.tsx      # Security utilities
│   └── types.ts          # TypeScript types
├── scripts/              # SQL migration scripts
└── public/               # Static assets
\`\`\`

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- **Live App**: [https://v0-vv-hotspots-web-app.vercel.app](https://v0-vv-hotspots-web-app.vercel.app)
- **v0 Chat**: [https://v0.app/chat/sfr0BCiZ5N3](https://v0.app/chat/sfr0BCiZ5N3)
