-- Add 10 real Vasai-Virar hotspots with accurate coordinates
-- First, clear existing placeholder data
DELETE FROM public.hotspots;

-- Insert real locations from Vasai-Virar area
INSERT INTO public.hotspots (name, category, description, address, latitude, longitude, image_url) VALUES

-- 1. Vasai Fort (Historic Heritage Site)
(
  'Vasai Fort',
  'hangout',
  'Historic Portuguese-era fort built in 1536, now a protected heritage site by ASI. Explore ancient churches, bastions, and stunning sea views. Perfect for history buffs and photographers. Best visited during golden hour.',
  'Vasai Village, Vasai Taluka, Palghar District',
  19.3307,
  72.8141,
  '/vasai-fort.jpg'
),

-- 2. Arnala Beach & Fort
(
  'Arnala Beach',
  'hangout',
  'Serene beach with historic Arnala Fort on a nearby island. Less crowded than Mumbai beaches, great for sunset views and local seafood. Take a boat ride to explore the fort ruins. Popular weekend getaway spot.',
  'Arnala Village, Virar West',
  19.4658,
  72.7325,
  '/arnala-beach.jpg'
),

-- 3. Rajodi Beach
(
  'Rajodi Beach',
  'hangout',
  'Beautiful beach between Virar and Vasai with multiple beachside cafes. Known for water sports, beach volleyball, and vibrant nightlife on weekends. The Cafe Hashtag here is Instagram-famous!',
  'Rajodi, Virar West, Palghar District',
  19.3877,
  72.7613,
  '/rajodi-beach.jpg'
),

-- 4. Cafe Hashtag (Rajodi Beach)
(
  'Cafe Hashtag',
  'cafe',
  'Iconic beachside cafe at Rajodi Beach with stunning sea views. Known for Instagram-worthy interiors, continental food, and amazing coffee. Live music on weekends. Must-try: their signature shakes and beach platters.',
  'Rajodi Beach, Virar West',
  19.3880,
  72.7620,
  '/cafe-hashtag.jpg'
),

-- 5. The Good Vibes Cafe (Navapur Beach)
(
  'The Good Vibes Cafe',
  'cafe',
  'Chill beachside cafe at Navapur Beach with bohemian vibes. Perfect for sunset hangouts, birthday celebrations, and casual dates. Great mocktails, wood-fired pizzas, and beach bonfire nights.',
  'Navapur Beach Road, Virar West',
  19.4439,
  72.7532,
  '/good-vibes-cafe.jpg'
),

-- 6. Pelhar Dam & Lake
(
  'Pelhar Dam',
  'park',
  'Scenic dam and lake surrounded by the Tungareshwar mountain range. Ideal picnic spot with waterfall during monsoons. Peaceful escape from city chaos. Pack a picnic and enjoy the untouched natural beauty.',
  'Pelhar Village, Juchandra, Vasai',
  19.4437,
  72.8963,
  '/pelhar-dam.jpg'
),

-- 7. Tungareshwar Temple & Wildlife Sanctuary
(
  'Tungareshwar Temple',
  'park',
  'Ancient Shiva temple atop Tungareshwar mountain with trekking trails through wildlife sanctuary. 18km trek with streams and waterfalls. Best visited in monsoons for misty mountain views. Entry fee applies.',
  'Tungareshwar Wildlife Sanctuary, Vasai',
  19.4165,
  72.9015,
  '/tungareshwar.jpg'
),

-- 8. Suruchi Beach
(
  'Suruchi Beach',
  'hangout',
  'Quiet beach in Vasai West, perfect for peaceful walks and meditation. Less commercialized than other beaches. Beautiful sunrise views and local fishing community vibes. Ideal for solo travelers and nature lovers.',
  'Khochivade, Vasai West',
  19.3401,
  72.7920,
  '/suruchi-beach.jpg'
),

-- 9. Navapur Beach
(
  'Navapur Beach',
  'hangout',
  'Popular beach destination with multiple cafes, resorts, and water sports. Host to Vintwoods Cafe and Good Vibes Cafe. Great for group hangouts, beach volleyball, and bonfire nights. Active nightlife scene.',
  'Navapur, Virar West',
  19.4435,
  72.7538,
  '/navapur-beach.jpg'
),

-- 10. Tipsy Panda - Asian Kitchen + Bar
(
  'Tipsy Panda',
  'food',
  'Top-rated Asian fusion restaurant and bar in Vasai. Known for sushi, dim sum, Thai curries, and craft cocktails. Modern interiors with private dining options. Perfect for celebrations and date nights.',
  'Vasai West, Near Station',
  19.3920,
  72.8280,
  '/tipsy-panda.jpg'
);
