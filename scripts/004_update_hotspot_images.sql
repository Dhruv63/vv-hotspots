-- Update hotspots with actual image paths
UPDATE public.hotspots SET 
  image_url = '/cozy-cafe-interior-warm-lighting-coffee.jpg'
WHERE name = 'Cinemax Café';

UPDATE public.hotspots SET 
  image_url = '/beautiful-park-nature-greenery-trees.jpg'
WHERE name = 'Pelhar Lake Garden';

UPDATE public.hotspots SET 
  image_url = '/gaming-arcade-neon-lights-video-games.jpg'
WHERE name = 'Game Zone Arena';

UPDATE public.hotspots SET 
  image_url = '/sunset-beach-hangout-spot-friends.jpg'
WHERE name = 'Arnala Beach';

UPDATE public.hotspots SET 
  image_url = '/indian-street-food-delicious-colorful.jpg'
WHERE name = 'Street Food Hub';
