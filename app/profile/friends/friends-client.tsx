"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowLeft, UserMinus, Check, X, MapPin, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { removeFriend, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, fetchFriends } from "@/app/actions/friends"
import { formatDistanceToNow } from "date-fns"

console.log('Friends Tab Version 3')

interface Friend {
  friendshipId: string
  friendId: string
  username: string
  avatarUrl: string | null
  bio: string | undefined
  city: string | undefined
  instagramUsername: string | undefined
  twitterUsername: string | undefined
  createdAt: string
}

interface FriendsClientProps {
  initialFriends: any[] // We can use 'any' or the return type of fetchFriends, but 'any' is safe for props passed from server component
  initialRequests: any[]
  initialSent: any[]
  userId: string
}

export function FriendsClient({ initialFriends, initialRequests, initialSent, userId }: FriendsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') || 'friends'
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Initialize with server data if available, but we'll fetch fresh data anyway as per existing pattern
  // Actually, let's respect initialFriends to avoid flicker if it's already correct type
  // But since we just changed the type, let's cast it or trust it.
  const [friends, setFriends] = useState<Friend[]>(initialFriends as Friend[])
  const [isLoading, setIsLoading] = useState(false) // Start false as we have initial data

  useEffect(() => {
    // Refresh friends on mount to ensure latest data
    const loadFriends = async () => {
      // Only set loading if we don't have friends yet? No, silent update is better usually.
      // But if initialFriends was empty, maybe show loading.
      if (friends.length === 0) setIsLoading(true)

      try {
        const data = await fetchFriends()
        // @ts-ignore - The action returns the correct type now
        setFriends(data)
      } catch (error) {
        console.error("Failed to fetch friends:", error)
        toast.error("Failed to load friends")
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, []) // Empty dependency array - run once on mount

  const handleTabChange = (t: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', t)
    router.push(`?${params.toString()}`)
  }

  const handleAction = async (action: Function, id: string, successMsg: string, arg?: string) => {
    setLoadingId(id)
    try {
      const res = await action(arg || id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(successMsg)
        router.refresh()
        // If the action was removing a friend, update the local state too
        if (action === removeFriend) {
           // For removeFriend, we passed friendshipId
           setFriends(prev => prev.filter(f => f.friendshipId !== id))
        }
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setLoadingId(null)
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      await handleAction(removeFriend, friendshipId, "Friend removed", friendshipId)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      <Navbar />

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
              Friends ({friends.length})
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`px-4 py-2 text-sm font-mono rounded transition-colors ${
                tab === 'requests'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Requests ({initialRequests.length})
            </button>
            <button
              onClick={() => handleTabChange('sent')}
              className={`px-4 py-2 text-sm font-mono rounded transition-colors ${
                tab === 'sent'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Sent ({initialSent.length})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tab === 'friends' && (
            isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
              </div>
            ) : (
              friends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friend) => (
                    <div
                      key={friend.friendshipId}
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
                          {friend.avatarUrl ? (
                            <Image src={friend.avatarUrl} alt={friend.username} fill className="object-cover" />
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
                          onClick={() => handleRemoveFriend(friend.friendshipId)}
                          disabled={loadingId === friend.friendshipId}
                          className="p-2 rounded border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                          title="Remove Friend"
                        >
                          {loadingId === friend.friendshipId ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <UserMinus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
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
            initialRequests.length > 0 ? (
              <div className="space-y-4">
                {initialRequests.map((req) => (
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
                        variant="default"
                        size="sm"
                        className="bg-lime-500 text-black hover:bg-lime-400"
                        onClick={() => handleAction(acceptFriendRequest, req.id, "Friend request accepted")}
                        disabled={loadingId === req.id}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </CyberButton>
                      <CyberButton
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleAction(rejectFriendRequest, req.id, "Friend request rejected")}
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
            initialSent.length > 0 ? (
              <div className="space-y-4">
                {initialSent.map((req) => (
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
                      onClick={() => handleAction(cancelFriendRequest, req.id, "Request cancelled")}
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
}
