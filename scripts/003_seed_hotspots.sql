-- Seed initial Vasai-Virar hotspots
INSERT INTO public.hotspots (name, category, description, address, latitude, longitude, image_url) VALUES
(
  'Cinemax Café',
  'cafe',
  'Trendy café near Cinemax with great coffee, snacks, and a chill vibe. Perfect for hangouts after movies or study sessions.',
  'Near Cinemax, Vasai West',
  19.3919,
  72.8397,
  '/placeholder.svg?height=400&width=600'
),
(
  'Pelhar Lake Garden',
  'park',
  'Scenic lake surrounded by lush greenery. Great for morning walks, photography, and peaceful picnics with friends.',
  'Pelhar, Vasai',
  19.4156,
  72.8234,
  '/placeholder.svg?height=400&width=600'
),
(
  'Game Zone Arena',
  'gaming',
  'Ultimate gaming destination with PS5, VR setups, and arcade games. Hosts weekly tournaments and has a snack bar.',
  'Station Road, Virar East',
  19.4557,
  72.8112,
  '/placeholder.svg?height=400&width=600'
),
(
  'Arnala Beach',
  'hangout',
  'Historic beach with Arnala Fort nearby. Best visited during sunset. Popular spot for beach sports and local seafood.',
  'Arnala Village, Virar West',
  19.4678,
  72.7456,
  '/placeholder.svg?height=400&width=600'
),
(
  'Street Food Hub',
  'food',
  'The legendary street food lane with everything from vada pav to pani puri. Open till late night, always buzzing with crowds.',
  'Near Vasai Station, Station Road',
  19.3678,
  72.8289,
  '/placeholder.svg?height=400&width=600'
);
