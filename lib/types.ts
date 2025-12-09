export interface Hotspot {
  id: string
  name: string
  category: "cafe" | "park" | "gaming" | "food" | "hangout" | "other"
  description: string | null
  address: string
  latitude: number
  longitude: number
  image_url: string | null
  created_at: string
  average_rating?: number
  active_checkins?: number
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  bio?: string | null
  city?: string | null
  instagram_username?: string | null
  twitter_username?: string | null
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  hotspot_id: string
  checked_in_at: string
  is_active: boolean
  note?: string | null
  is_public?: boolean
  profiles?: Profile
  hotspots?: Hotspot
}

export interface Rating {
  id: string
  user_id: string
  hotspot_id: string
  rating: number
  review?: string | null
  created_at: string
}

export interface ActivityFeedItem {
  id: string
  user_id: string
  hotspot_id: string
  checked_in_at: string
  username: string | null
  avatar_url: string | null
  hotspot_name: string
  hotspot_category: string
  note?: string | null
}

export interface HotspotPhoto {
  id: string
  user_id: string
  hotspot_id: string
  image_url: string
  thumbnail_url: string | null
  created_at: string
  profiles?: {
    username: string | null
  }
}
