"use client"

import { useState, useEffect, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowLeft, UserMinus, Check, X, MapPin, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { removeFriend, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getFriends, getRequests } from "@/app/actions/friends"
import { formatDistanceToNow } from "date-fns"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Friend {
  friendshipId: string
  friend: {
    id: string
    username: string
    avatar_url: string | null
    bio: string | null
    city: string | null
    instagram_username: string | null
    twitter_username: string | null
    [key: string]: any
  }
}

interface FriendsClientProps {
  initialFriends: any[]
  incoming: any[]
  sent: any[]
  userId: string
  user: SupabaseUser
  disableAutoFetch?: boolean
}

// Extracted and memoized FriendCard component
const FriendCard = memo(function FriendCard({
  item,
  loadingId,
  onRemove
}: {
  item: Friend
  loadingId: string | null
  onRemove: (friendshipId: string, friendUserId: string) => void
}) {
  const friend = item.friend;
  if (!friend) return null;

  const isLoading = loadingId === item.friendshipId;

  return (
    <div
      className="flex flex-col items-center p-6 rounded-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(232,255,0,0.2)]"
      style={{
        backgroundColor: '#0A0E27',
        borderColor: '#E8FF00',
        borderWidth: '1px'
      }}
    >
      {/* Avatar */}
      <Link href={`/users/${friend.username}`} className="mb-4 relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00D9FF] bg-cyber-dark relative z-10">
          {friend.avatar_url ? (
            <Image src={friend.avatar_url} alt={friend.username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0A0E27]">
              <User className="w-8 h-8 text-[#00D9FF]" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="text-center w-full mb-6">
        <Link href={`/users/${friend.username}`} className="hover:underline block mb-1">
          <h3 className="font-bold text-lg truncate" style={{ color: '#00D9FF' }}>@{friend.username}</h3>
        </Link>

        <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mb-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[150px]">{friend.city || 'Vasai-Virar'}</span>
        </div>

        {friend.bio && (
          <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5em] px-2">
            {friend.bio}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full mt-auto">
        <Link href={`/users/${friend.username}`} className="flex-1">
          <button
            className="w-full py-2 px-3 text-sm font-bold rounded transition-colors uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#FF006E',
              color: 'white'
            }}
          >
            View Profile
          </button>
        </Link>

        <button
          onClick={() => onRemove(item.friendshipId, friend.id)}
          disabled={isLoading}
          className="p-2 rounded border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-colors"
          title="Remove Friend"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UserMinus className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
})

export const FriendsClient = memo(function FriendsClient({ initialFriends, incoming, sent, userId, user, disableAutoFetch = false }: FriendsClientProps) {
  // Debug props
  console.log('Props received:', { incoming, sent })

  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') || 'friends'
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [friendsList, setFriendsList] = useState<Friend[]>(initialFriends as Friend[])
  const [requestsList, setRequestsList] = useState(incoming)
  const [sentList, setSentList] = useState(sent)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Explicitly fetch data on client mount/update to ensure synchronization, unless disabled
  useEffect(() => {
    if (disableAutoFetch) return;

    const refreshData = async () => {
       // Only show loading spinner if we don't have data, otherwise do silent update
       if (friendsList.length === 0 && requestsList.length === 0 && sentList.length === 0) {
           setIsLoading(true);
       }

       try {
           const [freshFriends, freshRequests] = await Promise.all([
               getFriends(),
               getRequests()
           ]);
           setFriendsList(freshFriends as Friend[]);
           setRequestsList(freshRequests.incoming);
           setSentList(freshRequests.sent);
           setError(null);
       } catch (error) {
           console.error("Failed to refresh friend data:", error);
           setError("Failed to load latest data. Please refresh.");
           toast.error("Failed to refresh friend data. Please try again.");
       } finally {
           setIsLoading(false);
       }
    }

    refreshData();
  }, [disableAutoFetch]);


  const handleTabChange = (t: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', t)
    router.push(`?${params.toString()}`)
  }

  const handleAction = async (action: Function, id: string, successMsg: string, context?: 'friend' | 'request' | 'sent') => {
    setLoadingId(id)
    try {
      const res = await action(id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(successMsg)
        router.refresh() // Ensure server state is refreshed

        // Optimistic Update
        if (context === 'friend') {
            setFriendsList(prev => prev.filter(f => f.friendshipId !== id));
        } else if (context === 'request') {
            setRequestsList(prev => prev.filter(r => r.id !== id));
        } else if (context === 'sent') {
            setSentList(prev => prev.filter(s => s.id !== id));
        }
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setLoadingId(null)
    }
  }

  // Memoized handler for removing friends to ensure FriendCard stability
  const handleRemoveFriend = useCallback(async (friendshipId: string, friendUserId: string) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      // Inline the logic of handleAction to avoid dependency complexity or just call it if stable
      // But handleAction depends on state setters, so we need to be careful.
      // Easiest is to just replicate logic or use a ref for handleAction?
      // Actually, since handleAction is defined in render, it changes every render.
      // Let's redefine handleRemoveFriend to be self-contained or use a memoized handleAction.
      // For simplicity here, I'll inline the core logic or use refs if needed.
      // But actually, since we reload the page, state updates matter less, but for consistency:

      setLoadingId(friendshipId)
      try {
        const res = await removeFriend(friendshipId, friendUserId)
        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success("Friend removed")
          window.location.reload() // Force full page refresh
        }
      } catch (e) {
        toast.error("An error occurred")
      } finally {
        setLoadingId(null)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      <Navbar user={user} />

      <main className="pt-20 pb-12 px-4 max-w-6xl mx-auto">
        <Link href="/profile" className="inline-flex items-center gap-2 text-cyber-cyan hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back to Profile</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold font-mono text-cyber-light">Friends & Requests</h1>

          <div className="flex bg-cyber-dark/50 p-1 rounded-lg border border-cyber-gray/30">
            <button
              onClick={() => handleTabChange('friends')}
              className={`px-4 py-2 text-sm font-mono rounded transition-colors ${
                tab === 'friends'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Friends ({friendsList.length})
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`px-4 py-2 text-sm font-mono rounded transition-colors ${
                tab === 'requests'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Requests ({incoming?.length || 0})
            </button>
            <button
              onClick={() => handleTabChange('sent')}
              className={`px-4 py-2 text-sm font-mono rounded transition-colors ${
                tab === 'sent'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Sent ({sent?.length || 0})
            </button>
          </div>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm text-center">
                {error}
            </div>
        )}

        <div className="space-y-4">
          {tab === 'friends' && (
            isLoading && friendsList.length === 0 ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
              </div>
            ) : (
              friendsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friendsList.map((item) => (
                    <FriendCard
                      key={item.friendshipId}
                      item={item}
                      loadingId={loadingId}
                      onRemove={handleRemoveFriend}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-[#E8FF00]/30 rounded-lg bg-[#0A0E27]/50">
                  <p className="text-[#00D9FF] font-mono text-lg mb-4">No friends yet</p>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">Start connecting with other explorers in Vasai-Virar to see their activity and discoveries!</p>
                  <Link href="/dashboard">
                    <CyberButton>Explore Hotspots</CyberButton>
                  </Link>
                </div>
              )
            )
          )}

          {tab === 'requests' && (
            incoming?.length > 0 ? (
              <div className="space-y-4">
                {incoming?.map((req: any) => (
                  <CyberCard key={req.id} className="p-4 flex items-center gap-4 border-l-4 border-l-lime-500">
                    <Link href={`/users/${req.sender.username}`} className="block flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-lime-500 bg-cyber-dark relative">
                        {req.sender?.avatar_url ? (
                          <Image src={req.sender.avatar_url} alt={req.sender.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-lime-500" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs text-lime-500 font-mono uppercase tracking-wider">Request Received</span>
                         <span className="text-xs text-cyber-gray">• {formatDistanceToNow(new Date(req.created_at))} ago</span>
                      </div>
                      <Link href={`/users/${req.sender.username}`} className="hover:underline">
                        <h3 className="font-bold text-cyber-light text-lg">@{req.sender?.username}</h3>
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <CyberButton
                        variant="ghost"
                        size="sm"
                        className="bg-lime-500 text-black hover:bg-lime-400"
                        onClick={() => handleAction(acceptFriendRequest, req.id, "Friend request accepted", 'request')}
                        disabled={loadingId === req.id}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </CyberButton>
                      <CyberButton
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleAction(rejectFriendRequest, req.id, "Friend request rejected", 'request')}
                        disabled={loadingId === req.id}
                      >
                        <X className="w-4 h-4" />
                      </CyberButton>
                    </div>
                  </CyberCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                <p className="text-cyber-gray font-mono">No pending friend requests.</p>
              </div>
            )
          )}

          {tab === 'sent' && (
            sent?.length > 0 ? (
              <div className="space-y-4">
                {sent?.map((req: any) => (
                  <CyberCard key={req.id} className="p-4 flex items-center gap-4 opacity-80">
                    <Link href={`/users/${req.receiver.username}`} className="block flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyber-gray bg-cyber-dark relative">
                        {req.receiver?.avatar_url ? (
                          <Image src={req.receiver.avatar_url} alt={req.receiver.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-cyber-gray" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs text-cyber-gray font-mono uppercase tracking-wider">Request Sent</span>
                         <span className="text-xs text-cyber-gray">• {formatDistanceToNow(new Date(req.created_at))} ago</span>
                      </div>
                      <Link href={`/users/${req.receiver.username}`} className="hover:underline">
                        <h3 className="font-bold text-cyber-light">@{req.receiver?.username}</h3>
                      </Link>
                    </div>
                    <CyberButton
                      variant="outline"
                      size="sm"
                      className="text-cyber-gray hover:text-red-400 hover:border-red-400"
                      onClick={() => handleAction(cancelFriendRequest, req.id, "Request cancelled", 'sent')}
                      disabled={loadingId === req.id}
                    >
                      Cancel
                    </CyberButton>
                  </CyberCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                <p className="text-cyber-gray font-mono">No sent requests pending.</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  )
})
