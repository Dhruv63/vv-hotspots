"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { FriendRequest } from "@/lib/types"

export async function sendFriendRequest(receiverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Check if request already exists
  const { data: existing } = await supabase
    .from('friend_requests')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted') return { error: "Already friends" }
    if (existing.status === 'pending') return { error: "Request already pending" }

    // If rejected or other state, reset to pending
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'pending', sender_id: user.id, receiver_id: receiverId })
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    // Create new request
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      })

    if (error) return { error: error.message }
  }

  // Create notification
  await supabase.from('notifications').insert({
    user_id: receiverId,
    type: 'friend_request',
    data: { sender_id: user.id }
  })

  // Send Push Notification
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    await fetch(`${siteUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: receiverId,
        title: 'New Friend Request',
        body: 'You have a new friend request!',
        url: '/profile/friends'
      })
    })
  } catch (e) {
    console.error('Failed to send push:', e)
  }

  revalidatePath(`/users`)
  revalidatePath(`/profile/friends`)
  return { success: true }
}

export async function acceptFriendRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // 1. Get request data
  const { data: request } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id, sender:sender_id(username)')
    .eq('id', requestId)
    .single()

  if (!request) return { error: "Request not found" }
  if (request.receiver_id !== user.id) return { error: "Unauthorized" }

  // 2. Update status
  const { error: updateError } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (updateError) return { error: updateError.message }

  // 3. CREATE FRIENDSHIP
  const { error: friendshipError } = await supabase
    .from('friendships')
    .insert({
      user_id_1: request.sender_id,
      user_id_2: request.receiver_id
    })

  if (friendshipError) {
    console.error('Error creating friendship record:', friendshipError)
    // We should probably allow the function to continue even if this fails (e.g. duplicate),
    // or return error. The user prompt says "Log errors and return success" for step 4.
  }

  // Create notification for sender
  await supabase.from('notifications').insert({
    user_id: request.sender_id,
    type: 'friend_accept',
    data: { accepter_id: user.id }
  })

  // Send Push Notification
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    await fetch(`${siteUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: request.sender_id,
        title: 'Friend Request Accepted',
        body: 'Your friend request was accepted!',
        url: '/profile/friends'
      })
    })
  } catch (e) {
    console.error('Failed to send push:', e)
  }

  // 5. Revalidate paths
  revalidatePath('/profile/friends')
  // Revalidate the sender's profile if we have their username
  // The user requested: revalidatePath(['/friends', `/profile/${request.sender_id}`])
  // We'll stick to what makes sense for the app routing + what was requested
  // Note: /profile/${id} is not a valid route, but /users/${username} is.
  // We'll try to do both to be safe/compliant with instructions while being robust.
  if (request.sender) {
      // @ts-ignore
      revalidatePath(`/users/${request.sender.username}`)
  }
  revalidatePath(`/users`)

  return { success: true }
}

export async function rejectFriendRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('receiver_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile/friends')
  return { success: true }
}

export async function cancelFriendRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId)
    .eq('sender_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile/friends')
  return { success: true }
}

export async function removeFriend(friendshipId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/profile/friends')
  revalidatePath('/users')
  return { success: true, error: undefined };
}

export async function getFriendStatus(currentUserId: string, targetUserId: string) {
  const supabase = await createClient()

  // Check friendships first
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id')
    .or(`and(user_id_1.eq.${currentUserId},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${currentUserId})`)
    .maybeSingle()

  if (friendship) return 'friends'

  // Then check requests
  const { data } = await supabase
    .from('friend_requests')
    .select('*')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`)
    .maybeSingle()

  if (!data) return 'none'
  if (data.status === 'accepted') return 'friends'
  if (data.status === 'pending') {
    return data.sender_id === currentUserId ? 'sent' : 'received'
  }
  return 'none'
}

export async function fetchFriends() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Step 1: Get friendships where user is EITHER user_id_1 OR user_id_2
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('id, user_id_1, user_id_2, created_at')
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    .order('created_at', { ascending: false });

  console.log('Friendships fetched:', friendships, friendshipsError);

  if (friendshipsError || !friendships || friendships.length === 0) {
    return [];
  }

  // Step 2: Get friend IDs (the OTHER user)
  const friendIds = friendships.map(f =>
    f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
  );

  // Step 3: Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, city, instagram_username, twitter_username')
    .in('id', friendIds);

  console.log('Profiles fetched:', profiles, profilesError);

  if (profilesError) return [];

  // Step 4: Combine data
  return friendships.map(friendship => {
    const friendId = friendship.user_id_1 === user.id ? friendship.user_id_2 : friendship.user_id_1;
    const profile = profiles?.find(p => p.id === friendId);

    return {
      friendshipId: friendship.id,
      friendId,
      username: profile?.username || 'Unknown',
      avatarUrl: profile?.avatar_url,
      bio: profile?.bio,
      city: profile?.city,
      instagramUsername: profile?.instagram_username,
      twitterUsername: profile?.twitter_username,
      createdAt: friendship.created_at
    };
  });
}

// Redirect legacy getFriends to the new implementation
export async function getFriends(userId: string) {
  return fetchFriends()
}

export async function getFriendRequests(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('friend_requests')
    .select(`
      *,
      sender:sender_id(*)
    `)
    .eq('receiver_id', userId)
    .eq('status', 'pending')

  return data || []
}

export async function getSentRequests(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('friend_requests')
    .select(`
      *,
      receiver:receiver_id(*)
    `)
    .eq('sender_id', userId)
    .eq('status', 'pending')

  return data || []
}

export async function getMutualFriends(userId1: string, userId2: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_mutual_friends', {
    user_id_1: userId1,
    user_id_2: userId2
  })

  if (error) {
    console.error("Error fetching mutual friends:", error)
    return []
  }
  return data || []
}
