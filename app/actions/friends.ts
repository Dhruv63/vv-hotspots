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

  // Verify request exists and user is receiver
  const { data: request } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) return { error: "Request not found" }
  if (request.receiver_id !== user.id) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  if (error) return { error: error.message }

  // Insert into friendships table
  const { error: friendshipError } = await supabase
    .from('friendships')
    .insert({
      user_id_1: request.sender_id,
      user_id_2: user.id
    })

  if (friendshipError) {
    console.error('Error creating friendship record:', friendshipError)
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

  revalidatePath(`/users`)
  revalidatePath(`/profile/friends`)
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

export async function removeFriend(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Delete from friendships
  const { error: friendshipError } = await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${friendId}),and(user_id_1.eq.${friendId},user_id_2.eq.${user.id})`)

  if (friendshipError) {
      console.error('Error removing friendship:', friendshipError)
      return { error: friendshipError.message }
  }

  // Find the request (could be sender or receiver) and delete it too
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
    .eq('status', 'accepted')

  if (error) return { error: error.message }

  revalidatePath(`/users`)
  revalidatePath(`/profile/friends`)
  return { success: true }
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
  if (data.status === 'accepted') return 'friends' // Should ideally be covered by friendships check, but for legacy compatibility
  if (data.status === 'pending') {
    return data.sender_id === currentUserId ? 'sent' : 'received'
  }
  return 'none' // rejected
}

export async function fetchFriends(userId: string) {
  console.log('[fetchFriends] Starting for userId:', userId)
  const supabase = await createClient()

  // 1. Query friendships
  // Verify the query uses: .from('friendships').select('id, user_id_1, user_id_2, created_at').or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('id, user_id_1, user_id_2, created_at')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

  if (friendshipsError) {
    console.error('[fetchFriends] Error fetching friendships:', friendshipsError)
    return []
  }

  console.log('[fetchFriends] Friendships found:', friendships)

  if (!friendships || friendships.length === 0) {
    console.log('[fetchFriends] No friendships found.')
    return []
  }

  // 2. Extract friend IDs
  // Log the friendIds array after mapping
  const friendIds = friendships.map(f =>
    f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
  )

  console.log('[fetchFriends] Friend IDs extracted:', friendIds)

  if (friendIds.length === 0) {
    return []
  }

  // 3. Fetch profiles
  // Log the profiles query results
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds)

  if (profilesError) {
    console.error('[fetchFriends] Error fetching friend profiles:', profilesError)
    return []
  }

  console.log('[fetchFriends] Profiles found:', profiles)

  return profiles
}

// Redirect legacy getFriends to the new implementation
export async function getFriends(userId: string) {
  return fetchFriends(userId)
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
