# AGENTS.md - VV Hotspots Codebase Guide

This document provides AI agents and developers with a comprehensive understanding of the VV Hotspots codebase architecture, patterns, and conventions.

## Codebase Structure

```
vv-hotspots/
├── app/                          # Next.js 15 App Router
│   ├── auth/                     # Authentication flow
│   │   ├── callback/route.ts     # OAuth callback handler
│   │   ├── error/page.tsx        # Auth error display
│   │   ├── login/page.tsx        # Login form
│   │   ├── sign-up/page.tsx      # Registration form
│   │   └── sign-up-success/      # Post-signup confirmation
│   ├── dashboard/                # Main application
│   │   ├── page.tsx              # Server component (data fetching)
│   │   └── dashboard-client.tsx  # Client component (interactivity)
│   ├── profile/                  # User profile
│   │   ├── page.tsx              # Server component
│   │   └── profile-client.tsx    # Client component
│   ├── layout.tsx                # Root layout with fonts
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Tailwind CSS + theme variables
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   │   ├── star-rating.tsx       # Interactive star rating
│   │   ├── cyber-button.tsx      # Cyberpunk styled button
│   │   ├── cyber-card.tsx        # Neon-bordered card
│   │   ├── category-badge.tsx    # Category indicator
│   │   └── ...                   # Other shadcn components
│   ├── activity-feed.tsx         # Real-time check-in feed
│   ├── hotspot-card.tsx          # Hotspot display card
│   ├── hotspot-detail.tsx        # Detailed hotspot modal
│   ├── hotspot-list.tsx          # Scrollable hotspot list
│   ├── map-view.tsx              # Leaflet map with markers
│   ├── navbar.tsx                # Top navigation bar
│   └── theme-provider.tsx        # Dark theme provider
│
├── lib/                          # Utilities and config
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── proxy.ts              # Middleware utilities
│   ├── security.tsx              # Input sanitization, rate limiting
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Helper functions (cn, etc.)
│
├── scripts/                      # Database migrations
│   ├── 001_create_tables.sql     # Core schema + RLS
│   ├── 002_create_profile_trigger.sql
│   ├── 003_seed_hotspots.sql
│   ├── 004_update_hotspot_images.sql
│   ├── 005_add_real_hotspots.sql
│   ├── 006_add_review_column.sql
│   ├── 007_verify_rls.sql
│   ├── 008_create_hotspot_photos.sql
│   └── 009_hotspot_photos_rls.sql
│
├── proxy.ts                      # Next.js middleware
└── hooks/                        # Custom React hooks
    ├── use-mobile.ts             # Mobile detection
    └── use-toast.ts              # Toast notifications
```

## Key Components

### Dashboard (`app/dashboard/`)

The main application view with three-column layout on desktop:

| Column | Component | Purpose |
|--------|-----------|---------|
| Left | `HotspotList` | Scrollable list of hotspots with search/filter |
| Center | `MapView` | Interactive Leaflet map with markers |
| Right | `ActivityFeed` | Real-time check-in stream |

**State Management:**
- `selectedHotspot` - Currently selected hotspot
- `currentCheckIn` - User's active check-in
- `userRatings` - Map of hotspot IDs to user's ratings
- `processingAction` - Prevents double-clicks during API calls

### Map View (`components/map-view.tsx`)

Leaflet-based map with custom neon markers:

```typescript
// Category color mapping
const categoryColors = {
  cafe: '#FFFF00',    // Yellow
  park: '#CCFF00',    // Lime
  gaming: '#FFD700',  // Gold
  food: '#FFFFE0',    // Light Yellow
  hangout: '#F7FF00', // Neon Yellow
  other: '#E0E0E0'    // Gray
}
```

Features:
- Custom SVG markers with glow effects
- Popup cards with check-in buttons
- GPS location finder
- Category legend

### Real-time Subscriptions (`components/activity-feed.tsx`)

Uses Supabase Realtime to subscribe to check-ins:

```typescript
const channel = supabase
  .channel('check_ins_realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'check_ins',
    filter: 'is_active=eq.true'
  }, handleNewCheckIn)
  .subscribe()
```

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | References auth.users |
| username | text | Display name |
| avatar_url | text | Profile image URL |
| created_at | timestamptz | Account creation |
| updated_at | timestamptz | Last profile update |

#### `hotspots`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Hotspot name |
| description | text | About the location |
| category | text | cafe/park/gaming/food/hangout |
| address | text | Physical address |
| latitude | numeric | GPS latitude |
| longitude | numeric | GPS longitude |
| image_url | text | Cover image |
| created_at | timestamptz | When added |

#### `check_ins`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (FK) | References profiles |
| hotspot_id | uuid (FK) | References hotspots |
| checked_in_at | timestamptz | Check-in time |
| is_active | boolean | Currently checked in? |

#### `ratings`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (FK) | References profiles |
| hotspot_id | uuid (FK) | References hotspots |
| rating | integer | 1-5 stars |
| review | text | Optional review text |
| created_at | timestamptz | When rated |

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

```sql
-- Profiles: Anyone can read, users update own
-- Hotspots: Anyone can read
-- Check-ins: Anyone can read, users manage own
-- Ratings: Anyone can read, users manage own
```

## API Patterns

### Server Components (Data Fetching)

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: hotspots } = await supabase
    .from('hotspots')
    .select('*')
    .order('name')
  
  return <DashboardClient hotspots={hotspots} />
}
```

### Client Components (Mutations)

```typescript
// Using browser client for mutations
const supabase = createBrowserClient()

const handleCheckIn = async (hotspotId: string) => {
  const { error } = await supabase
    .from('check_ins')
    .insert({ hotspot_id: hotspotId, user_id: userId })
}
```

## Styling Conventions

### Cyberpunk Theme

**Color Palette:**
- Primary: `#FFFF00` (Neon Yellow)
- Secondary: `#CCFF00` (Bright Lime)
- Accent: `#FFD700` (Electric Yellow)
- Background: `#000000` (Pure Black)
- Surface: `#0a0a0f` (Dark Gray)

**Common Patterns:**
```tsx
// Neon glow effect
className="shadow-[0_0_20px_rgba(255,255,0,0.3)]"

// Gradient border
className="bg-gradient-to-r from-yellow-400 to-lime-400"

// Text glow
className="text-cyber-primary drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]"
```

### Mobile Responsiveness

- `< 768px`: Bottom drawer navigation, full-width map
- `>= 768px`: Three-column layout with sidebars

```tsx
// Mobile detection
const isMobile = useIsMobile() // from hooks/use-mobile.ts

// Responsive classes
className="fixed inset-x-0 bottom-0 md:relative md:w-80"
```

## Security

### Input Sanitization (`lib/security.tsx`)

```typescript
sanitizeInput(input)      // XSS prevention
sanitizeUsername(name)    // Alphanumeric only
sanitizeAvatarUrl(url)    // HTTPS validation
```

### Rate Limiting

```typescript
const rateLimits = {
  checkIn: { max: 10, windowMs: 60000 },   // 10/min
  rating: { max: 20, windowMs: 60000 },    // 20/min
  profileUpdate: { max: 5, windowMs: 60000 } // 5/min
```

## Common Tasks

### Adding a New Hotspot Category

1. Update `categoryColors` in `map-view.tsx`
2. Add icon mapping in marker creation
3. Update filter buttons in `dashboard-client.tsx`
4. Add to `CategoryBadge` component

### Adding a New Table

1. Create SQL migration in `scripts/`
2. Add TypeScript types in `lib/types.ts`
3. Enable RLS with appropriate policies
4. Update components to fetch/display data

### Debugging Tips

Use `[v0]` prefixed console logs:
```typescript
console.log('[v0] Check-in data:', checkInData)
```

These are automatically filtered in production builds.
