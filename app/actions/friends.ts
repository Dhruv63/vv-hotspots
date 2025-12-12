'use server'
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Check if request already exists
  const { data: existing } = await supabase
    .from('friend_requests')
    .select('id, status')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .maybeSingle();

  if (existing) {
     if (existing.status === 'accepted') return { error: 'Already friends' };
     if (existing.status === 'pending') return { error: 'Request already pending' };
     // If rejected, update status to pending
     if (existing.status === 'rejected') {
         const { error } = await supabase
             .from('friend_requests')
             .update({ status: 'pending', sender_id: user.id, receiver_id: receiverId })
             .eq('id', existing.id);
         if (error) return { error: error.message };
         revalidatePath('/profile/friends');
         revalidatePath('/users');
         return { success: true };
     }
  }

  const { error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' });

  if (error) return { error: error.message };

  revalidatePath('/profile/friends');
  revalidatePath('/users');
  return { success: true };
}

export async function acceptFriendRequest(requestId: string) {
  const supabase = await createClient();

  // Get request details first
  const { data: request } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id')
    .eq('id', requestId)
    .single();

  if (!request) return { error: 'Request not found' };

  // Update status
  await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  // CREATE FRIENDSHIP
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id_1: request.sender_id, user_id_2: request.receiver_id });

  if (error) return { error: error.message };

  revalidatePath('/profile/friends');
  revalidatePath('/users');

  // Revalidate specific profile pages
  revalidatePath(`/profile/${request.sender_id}`);
  revalidatePath(`/profile/${request.receiver_id}`);

  return { success: true };
}

export async function rejectFriendRequest(requestId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  revalidatePath('/profile/friends');
  revalidatePath('/users');
  return { success: !error };
}

export async function removeFriend(friendshipId: string, friendUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) return { success: false, error: error.message };

  // Also delete the associated friend_request to prevent "Already friends" state and UI glitches
  // The public profile page relies on friend_requests status, so this must be cleaned up
  if (user && friendUserId) {
      await supabase.from('friend_requests')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${user.id})`);
  }

  revalidatePath('/friends');
  revalidatePath('/profile');
  revalidatePath(`/profile/${friendUserId}`);
  revalidatePath(`/users/[username]`);

  // Also revalidate the legacy paths just in case
  revalidatePath('/profile/friends');
  revalidatePath('/users');

  return { success: true };
}

// Adapted to support optional userId for public profile compatibility
export async function getFriends(userId?: string) {
  const supabase = await createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  const { data: friendships } = await supabase
    .from('friendships')
    .select('id, user_id_1, user_id_2, created_at')
    .or(`user_id_1.eq.${targetUserId},user_id_2.eq.${targetUserId}`)
    .limit(50);

  if (!friendships) return [];

  const friendIds = friendships.map(f => f.user_id_1 === targetUserId ? f.user_id_2 : f.user_id_1);

  if (friendIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, city')
    .in('id', friendIds);

  return friendships.map(f => ({
    friendshipId: f.id,
    friend: profiles?.find(p => p.id === (f.user_id_1 === targetUserId ? f.user_id_2 : f.user_id_1))
  }));
}

export async function getRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('getRequests: No user found');
    return { incoming: [], sent: [] };
  }

  console.log('getRequests: Fetching for user', user.id);

  const { data: incoming, error: incomingError } = await supabase
    .from('friend_requests')
    .select('id, created_at, status, sender:sender_id(id, username, avatar_url, bio, city)')
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .limit(50);

  if (incomingError) {
    console.error('getRequests: Error fetching incoming:', incomingError);
  } else {
    console.log('getRequests: Incoming result count:', incoming?.length);
    if (incoming?.length === 0) {
      console.log('getRequests: Incoming result is empty array');
    } else {
      console.log('getRequests: Incoming result first item:', incoming?.[0]);
    }
  }

  const { data: sent, error: sentError } = await supabase
    .from('friend_requests')
    // Use column name for FK relationship to avoid PGRST200
    .select('id, created_at, status, receiver:receiver_id(id, username, avatar_url, bio, city)')
    .eq('sender_id', user.id)
    .eq('status', 'pending')
    .limit(50);

  if (sentError) {
    console.error('getRequests: Error fetching sent:', sentError);
  } else {
    console.log('getRequests: Sent result count:', sent?.length);
  }

  return { incoming: incoming || [], sent: sent || [] };
}

// Helper for cancelling requests (not in prompt but essential for 'sent' tab management)
export async function cancelFriendRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId)
    .eq('sender_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile/friends');
  revalidatePath('/users');
  return { success: true };
}

// Legacy support for user profile page
export async function getMutualFriends(userId1: string, userId2: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_mutual_friends', {
    user_id_1: userId1,
    user_id_2: userId2
  }).limit(50);
  if (error) return [];
  return data || [];
}

// Legacy support for user profile page button state
export async function getFriendStatus(userId1: string, userId2: string) {
  const supabase = await createClient();

  // Check friendships table first (Source of Truth)
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id')
    .or(`and(user_id_1.eq.${userId1},user_id_2.eq.${userId2}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1})`)
    .maybeSingle();

  if (friendship) return 'friends';

  // Then check friend_requests
  const { data: request } = await supabase
    .from('friend_requests')
    .select('id, sender_id')
    .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .eq('status', 'pending')
    .maybeSingle();

  if (!request) return 'none';

  if (request.sender_id === userId1) return 'pending_sent';
  return 'pending_received';
}
