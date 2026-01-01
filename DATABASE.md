# Database Schema Documentation

## Overview
The application uses a PostgreSQL database hosted on Supabase. Row Level Security (RLS) is enabled on all sensitive tables to ensure data privacy and security.

## Tables

### `public.profiles`
Stores user profile information.
- **id**: `UUID` (Primary Key, references `auth.users.id`)
- **username**: `TEXT` (Unique)
- **avatar_url**: `TEXT`
- **bio**: `TEXT`
- **city**: `TEXT` (Default: 'Vasai-Virar')
- **instagram_username**: `TEXT`
- **twitter_username**: `TEXT`
- **points**: `INTEGER` (Gamification score)
- **created_at**: `TIMESTAMP`

### `public.hotspots`
Stores distinct locations (hotspots) on the map.
- **id**: `UUID` (Primary Key)
- **name**: `TEXT`
- **category**: `TEXT` (Enum: 'cafe', 'park', 'gaming', 'food', 'hangout', 'other')
- **description**: `TEXT`
- **address**: `TEXT`
- **latitude**: `DECIMAL`
- **longitude**: `DECIMAL`
- **image_url**: `TEXT`
- **created_at**: `TIMESTAMP`

### `public.check_ins`
Records user visits to hotspots.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (References `profiles.id`)
- **hotspot_id**: `UUID` (References `hotspots.id`)
- **checked_in_at**: `TIMESTAMP`
- **is_active**: `BOOLEAN` (Indicates if the user is currently here)
- **note**: `TEXT`
- **is_public**: `BOOLEAN`

### `public.ratings`
Stores user ratings and reviews for hotspots.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (References `profiles.id`)
- **hotspot_id**: `UUID` (References `hotspots.id`)
- **rating**: `INTEGER` (1-5)
- **review**: `TEXT`
- **created_at**: `TIMESTAMP`
- **Constraint**: Unique on `(user_id, hotspot_id)`

### `public.hotspot_photos`
User-uploaded photos for hotspots.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (References `profiles.id`)
- **hotspot_id**: `UUID` (References `hotspots.id`)
- **image_url**: `TEXT`
- **thumbnail_url**: `TEXT`
- **created_at**: `TIMESTAMP`

### `public.friend_requests`
Manages the state of friend connections.
- **id**: `UUID` (Primary Key)
- **sender_id**: `UUID` (References `profiles.id`)
- **receiver_id**: `UUID` (References `profiles.id`)
- **status**: `TEXT` ('pending', 'accepted', 'rejected')
- **created_at**: `TIMESTAMP`
- **updated_at**: `TIMESTAMP`

### `public.friendships`
Stores established friend connections for faster lookup.
- **id**: `UUID` (Primary Key)
- **user_id_1**: `UUID` (References `profiles.id`)
- **user_id_2**: `UUID` (References `profiles.id`)
- **created_at**: `TIMESTAMP`
- **Constraint**: Unique on pair.

### `public.notifications`
System and user-triggered notifications.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (Recipient)
- **type**: `TEXT` ('friend_request', 'friend_accept', etc.)
- **data**: `JSONB` (Payload)
- **read**: `BOOLEAN`
- **created_at**: `TIMESTAMP`

### `public.push_subscriptions`
Web Push API subscriptions for users.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID`
- **endpoint**: `TEXT`
- **p256dh**: `TEXT`
- **auth**: `TEXT`

### `public.saved_hotspots`
User bookmarks.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID`
- **hotspot_id**: `UUID`
- **created_at**: `TIMESTAMP`

### `public.check_in_likes`
Social likes on check-ins.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID`
- **check_in_id**: `UUID`
- **created_at**: `TIMESTAMP`

## Row Level Security (RLS) Policies
- **Public Read Access**: enabled for `hotspots`, `profiles`, `hotspot_photos`, `check_ins`, `ratings`.
- **Private Write Access**: Users can only INSERT/UPDATE/DELETE their own rows (checked via `auth.uid()`).
- **Friend Privacy**: Friend requests are only visible to the sender and receiver.
- **Notification Privacy**: Users can only see their own notifications.

## Database Functions
- `get_mutual_friends(user_id_1, user_id_2)`: Returns a list of mutual friends between two users.
