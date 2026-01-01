# Code Structure Audit

## Directory: /app
The `app` directory uses Next.js App Router conventions.

- **(landing)**: Public-facing marketing pages.
    - `page.tsx`: Landing page logic.
    - `components/`: Specific components for the landing page (`LandingDesktop.tsx`, `LandingMobile.tsx`).
- **(main)**: Authenticated application routes.
    - `dashboard/`: The main application view (Map + Sidebar).
    - `profile/`: User profile management.
        - `edit/`: Edit profile form.
        - `friends/`: Friend list and request management.
    - `settings/`: User settings (e.g., Theme selection).
    - `users/[username]/`: Public profile views for other users.
- **actions/**: Server Actions for data mutations.
    - `friends.ts`: Friend request logic.
    - `photos.ts`: Photo upload/saving logic.
    - `reviews.ts`: Review submission.
    - `theme.ts`: User theme preferences.
- **admin/**: Administrative interface.
- **ai-planner/**: AI Itinerary Generator feature.
- **api/**: API Routes (see ARCHITECTURE.md).
- **auth/**: Authentication related pages (Sign-up, Callback, Error).
- **login/**: Login page.
- **globals.css**: Global styles and Tailwind configuration.
- **layout.tsx**: Root layout shell.

## Directory: /components
Reusable React components.

### Feature Components
- `map-view.tsx`: The core Leaflet map component.
- `hotspot-list.tsx`: Sidebar list of hotspots.
- `hotspot-detail.tsx`: Modal for hotspot details.
- `hotspot-card.tsx`: Card component for individual hotspots.
- `check-in-modal.tsx`: Logic and UI for checking in.
- `rate-review-modal.tsx`: UI for submitting reviews.
- `activity-feed.tsx`: Live feed of user activity.
- `photo-gallery.tsx`: Gallery display for hotspot photos.
- `photo-upload-button.tsx`: Upload widget.
- `onboarding-flow.tsx`: New user walkthrough.
- `active-users-list.tsx`: List of currently active users.

### UI Primitives (in /components/ui)
- `modal.tsx`: Generic modal wrapper.
- `cyber-button.tsx`, `cyber-card.tsx`: Theme-specific styled components.
- `star-rating.tsx`: Star input component.
- `marker-cluster.tsx`: Map clustering wrapper.

### Layout Components
- `navbar.tsx`: Top navigation bar.
- `bottom-nav.tsx`: Mobile bottom navigation.
- `unified-menu-drawer.tsx`: Mobile menu drawer.

## Directory: /lib
Utilities and helper functions.

- **supabase/**:
    - `client.ts`: Browser client initialization.
    - `server.ts`: Server client initialization (cookie handling).
    - `proxy.ts`: Middleware logic.
- `utils.ts`: General helper functions (class merging, formatting).
- `types.ts`: TypeScript interfaces for the application.
- `security.ts`: Input sanitization and rate limiting.
- `coords.ts`: Coordinate validation.
- `themes.ts`: Theme definitions and logic.
- `map-icons.tsx`: Icon mapping for map markers.

## Directory: /scripts
Database migration and setup scripts.
- Contains numbered SQL files (e.g., `001_create_tables.sql`, `012_friend_system.sql`) that define the schema and RLS policies.

## Configuration Files
- `next.config.mjs`: Next.js configuration (PWA, Cloudinary domains).
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `proxy.ts`: Root middleware entry point.
