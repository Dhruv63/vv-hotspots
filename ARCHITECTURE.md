# Technical Architecture

## Tech Stack Summary
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4 via `@theme inline`), `tailwindcss-animate`, Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: React-Leaflet / Leaflet
- **State Management**: React Context (`AppContext`) + Local State
- **Image Storage**: Cloudinary
- **AI**: Google Gemini (`@google/generative-ai`)
- **Deployment Target**: Vercel (implied by `vercel.json` or standard Next.js usage)

## Project Structure Overview
The project follows the standard Next.js 16 App Router structure:
- `app/`: Contains all routes, layouts, and page components.
    - `(main)/`: Route group for the authenticated dashboard and inner pages.
    - `(landing)/`: Route group for the public landing page.
    - `api/`: Backend API routes (Server Functions).
- `components/`: Reusable UI components.
    - `ui/`: Primitives (buttons, inputs, modals).
    - Functional components (e.g., `map-view.tsx`, `hotspot-list.tsx`).
- `lib/`: Utilities, helpers, type definitions, and Supabase client setup.
- `public/`: Static assets (icons, images, service worker).
- `scripts/`: SQL migration scripts for Supabase.

## Authentication Flow
1.  **Client-Side**: `lib/supabase/client.ts` initializes the Supabase client.
2.  **Server-Side**: `lib/supabase/server.ts` handles cookie-based session management for Server Components and Actions.
3.  **Middleware**: `lib/supabase/proxy.ts` (used by root `proxy.ts`) manages session refreshing and route protection.
4.  **Protected Routes**: The `(main)` group likely enforces authentication via middleware or layout checks.

## API Route Structure
All API endpoints are located in `app/api/`.

| Route | Method | Purpose | Auth Required? |
|-------|--------|---------|----------------|
| `/api/generate-itinerary` | POST | Generates day plans using Gemini AI | Yes |
| `/api/sign-cloudinary-params` | POST | Signs parameters for secure image uploads | Yes |
| `/api/theme` | GET | Syncs user theme preference | Optional |
| `/api/notifications` | GET | Fetches recent notifications | Yes |
| `/api/notifications/create` | POST | Creates a new notification | Yes |
| `/api/notifications/mark-read` | POST | Marks notifications as read | Yes |
| `/api/notifications/send` | POST | Triggers a push notification | Yes |
| `/api/notifications/subscribe` | POST/DELETE | Manages push subscriptions | Yes |

## Database Integration
- **Client**: `@supabase/supabase-js`
- **ORM**: None (Raw Supabase query builder is used).
- **Real-time**: Uses `supabase.channel()` to subscribe to changes in `check_ins` and `hotspot_photos`.
- **Security**: Row Level Security (RLS) policies are extensively used to secure data access (see `DATABASE.md` for details).

## External Services
1.  **Supabase**:
    - Auth: User management.
    - Database: PostgreSQL for all app data.
    - Realtime: Live updates for feeds and maps.
2.  **Cloudinary**:
    - Hosting and transformation of user-uploaded images.
3.  **Google Gemini**:
    - Generative AI for the "AI Planner" feature.
4.  **OpenStreetMap / CartoDB**:
    - Map tiles for the Leaflet map implementation.

## Environment Variables
The application relies on the following environment variables (stored in `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Public Key.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary Cloud Name.
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`: Cloudinary API Key.
- `CLOUDINARY_API_SECRET`: Cloudinary API Secret.
- `GEMINI_API_KEY`: API Key for Google Gemini.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: VAPID Public Key for Push Notifications.
- `VAPID_PRIVATE_KEY`: VAPID Private Key for Push Notifications.

## Dependencies Audit

### Core Dependencies
- `next` (^16.0.8): The React framework.
- `react`, `react-dom` (19.2.0): UI library.
- `@supabase/supabase-js`, `@supabase/ssr`: Authentication and database client.
- `leaflet`, `react-leaflet`: Interactive maps.
- `tailwindcss`, `postcss`, `autoprefixer`: CSS styling framework.

### Feature Specific
- `@google/generative-ai`: Google Gemini AI integration.
- `cloudinary`, `next-cloudinary`: Image management.
- `web-push`: Push notifications protocol.
- `date-fns`: Date formatting (used in Activity Feed).
- `zod`: Schema validation (used in Actions/Forms).
- `react-hook-form`: Form state management.
- `lucide-react`: Icon set.
- `sonner`: Toast notifications.

### UI Components (Radix UI)
- `@radix-ui/react-*`: Various accessible primitives used for modals, dropdowns, tabs, dialogs, sliders, etc.

### Utilities
- `clsx`, `tailwind-merge`: CSS class manipulation.
- `cmdk`: Command palette (search).
- `recharts`: Data visualization (implied usage for stats).
- `vaul`: Drawer component.
