import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardClient } from './dashboard-client'
import React from 'react'

// Mock Supabase
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()

// Chain mocks
const chain = {
  update: mockUpdate,
  insert: mockInsert,
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
  eq: mockEq,
  then: vi.fn(),
}
// Set circular references
chain.update.mockReturnValue(chain)
chain.insert.mockReturnValue(chain)
chain.eq.mockReturnValue(chain)

mockFrom.mockReturnValue(chain)

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null }),
  },
  from: mockFrom,
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

// Mock useRouter
const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
}
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

// Mock components
vi.mock('@/components/map-view', () => ({ MapView: () => <div data-testid="map-view" /> }))
vi.mock('@/components/hotspot-list', () => ({ HotspotList: () => <div data-testid="hotspot-list" /> }))
vi.mock('@/components/hotspot-detail', () => ({ HotspotDetail: () => <div data-testid="hotspot-detail" /> }))
vi.mock('@/components/activity-feed', () => ({ ActivityFeed: () => <div data-testid="activity-feed" /> }))
vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar" /> }))

describe('DashboardClient', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' } as any
  const mockHotspots = [
    { id: 'spot-1', name: 'Test Spot', category: 'cafe', latitude: 0, longitude: 0, address: 'Test St' },
  ] as any

  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain behavior
    chain.then.mockImplementation((resolve) => resolve({ error: null, data: null }))
    chain.single.mockResolvedValue({ error: null, data: {} })
  })

  it('renders check-out button when user is checked in', () => {
    render(
      <DashboardClient
        user={mockUser}
        hotspots={mockHotspots}
        activeCheckins={{}}
        averageRatings={{}}
        activityFeed={[]}
        userCurrentCheckin="spot-1"
        userRatings={{}}
        userReviews={{}}
      />
    )

    expect(screen.getByRole('button', { name: /check out/i })).toBeInTheDocument()
    expect(screen.getByText('Test Spot')).toBeInTheDocument()
  })

  it('calls check-out logic and updates state on click', async () => {
    render(
      <DashboardClient
        user={mockUser}
        hotspots={mockHotspots}
        activeCheckins={{}}
        averageRatings={{}}
        activityFeed={[]}
        userCurrentCheckin="spot-1"
        userRatings={{}}
        userReviews={{}}
      />
    )

    const checkoutBtn = screen.getByRole('button', { name: /check out/i })
    fireEvent.click(checkoutBtn)

    expect(mockFrom).toHaveBeenCalledWith('check_ins')
    expect(mockUpdate).toHaveBeenCalledWith({ is_active: false })
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockEq).toHaveBeenCalledWith('is_active', true)

    // Verify success message or UI update (banner disappears)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /check out/i })).not.toBeInTheDocument()
    })

    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('handles check-out error', async () => {
    // Setup error response
    chain.then.mockImplementation((resolve) => resolve({ error: { message: 'Supabase error' } }))

    render(
      <DashboardClient
        user={mockUser}
        hotspots={mockHotspots}
        activeCheckins={{}}
        averageRatings={{}}
        activityFeed={[]}
        userCurrentCheckin="spot-1"
        userRatings={{}}
        userReviews={{}}
      />
    )

    const checkoutBtn = screen.getByRole('button', { name: /check out/i })
    fireEvent.click(checkoutBtn)

    await waitFor(() => {
      expect(screen.getByText(/supabase error/i)).toBeInTheDocument()
    })

    // Button should still be there
    expect(screen.getByRole('button', { name: /check out/i })).toBeInTheDocument()
  })
})
