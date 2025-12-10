import { createClient } from "@/lib/supabase/client"

export interface FriendData {
  friendshipId: string
  friendId: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  city: string | null
  instagramUsername: string | null
  twitterUsername: string | null
  createdAt: string
}

export async function fetchFriends(userId: string): Promise<FriendData[]> {
  const supabase = createClient()

  const { data: friendships, error: friendshipError } = await supabase
    .from('friendships')
    .select('id, user_id_1, user_id_2, created_at')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

  if (friendshipError) throw friendshipError
  if (!friendships || friendships.length === 0) return []

  const friendIds = friendships.map((f: any) =>
    f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
  )

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds)

  if (profileError) throw profileError

  return friendships.map((friendship: any) => {
    const friendId = friendship.user_id_1 === userId ? friendship.user_id_2 : friendship.user_id_1
    const profile = profiles?.find((p: any) => p.id === friendId)

    if (!profile) return null

    return {
      friendshipId: friendship.id,
      friendId: friendId,
      username: profile.username,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      city: profile.city,
      instagramUsername: profile.instagram_username,
      twitterUsername: profile.twitter_username,
      createdAt: friendship.created_at
    }
  }).filter((item): item is FriendData => item !== null)
}

export async function removeFriend(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', id)

  if (error) throw error
}
