# Contributing to VV Hotspots

Thank you for your interest in contributing to VV Hotspots! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.local` and configure
4. Run database migrations from `scripts/` folder
5. Start dev server: `pnpm dev`

## Code Style Guide

### TypeScript

- Use TypeScript for all new code
- Define interfaces in `lib/types.ts`
- Avoid `any` type - use proper typing

\`\`\`typescript
// Good
interface Hotspot {
  id: string
  name: string
  category: 'cafe' | 'park' | 'gaming' | 'food' | 'hangout'
}

// Avoid
const hotspot: any = fetchData()
\`\`\`

### React Components

- Use functional components with hooks
- Split into Server and Client components appropriately
- Co-locate related files (page.tsx + page-client.tsx)

\`\`\`typescript
// Server Component (data fetching)
export default async function Page() {
  const data = await fetchData()
  return <PageClient data={data} />
}

// Client Component (interactivity)
'use client'
export function PageClient({ data }: Props) {
  const [state, setState] = useState()
  return <div>...</div>
}
\`\`\`

### Styling

- Use Tailwind CSS classes
- Follow the cyberpunk theme (cyan, purple, pink neons)
- Mobile-first responsive design
- Use semantic design tokens from `globals.css`

\`\`\`tsx
// Correct - using theme tokens
<div className="bg-background text-foreground border-primary" />

// Correct - cyberpunk styling
<button className="bg-cyan-500/20 border border-cyan-500 text-cyan-400 
                   shadow-[0_0_15px_rgba(255,255,0,0.3)]" />
\`\`\`

### File Naming

- Use kebab-case for files: `hotspot-detail.tsx`
- Use PascalCase for components: `HotspotDetail`
- Suffix client components: `*-client.tsx`

## Adding New Features

### 1. Database Changes

Create a new migration script:

\`\`\`sql
-- scripts/008_add_feature.sql
ALTER TABLE hotspots ADD COLUMN new_field text;

-- Enable RLS if new table
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "policy_name" ON new_table
  FOR SELECT USING (true);
\`\`\`

### 2. Type Definitions

Update `lib/types.ts`:

\`\`\`typescript
export interface Hotspot {
  // ... existing fields
  new_field?: string  // Add new field
}
\`\`\`

### 3. Component Implementation

1. Create component in `components/`
2. Add to parent page/component
3. Handle loading and error states
4. Add mobile responsiveness

### 4. Security Considerations

- Sanitize all user inputs using `lib/security.tsx`
- Implement rate limiting for mutation actions
- Verify RLS policies cover new tables

## Testing Approach

### Manual Testing Checklist

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Test with slow network (DevTools throttling)
- [ ] Test offline behavior
- [ ] Test with/without authentication
- [ ] Verify RLS policies work correctly

### Debug Logging

Use prefixed console logs during development:

\`\`\`typescript
console.log('[v0] Component mounted with props:', props)
console.log('[v0] API response:', response)
console.log('[v0] Error occurred:', error)
\`\`\`

Remove debug logs before submitting PR.

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make your changes following the style guide
3. Test thoroughly on multiple devices
4. Update documentation if needed
5. Submit PR with clear description

### PR Description Template

\`\`\`markdown
## Summary
Brief description of changes

## Changes
- Added X component
- Updated Y functionality
- Fixed Z bug

## Testing
- Tested on Chrome/Firefox/Safari
- Tested on mobile viewport
- Verified RLS policies

## Screenshots
[Add screenshots for UI changes]
\`\`\`

## Questions?

Open an issue for questions or discussions about the codebase.
