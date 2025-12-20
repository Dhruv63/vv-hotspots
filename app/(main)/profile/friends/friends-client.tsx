"use client"

import { useState, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { CyberButton } from "@/components/ui/cyber-button"
import { UserMinus, Check, X, MapPin, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { removeFriend, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getFriends, getRequests } from "@/app/actions/friends"
import { formatDistanceToNow } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
  disableAutoFetch?: boolean
}

// Extracted and memoized FriendCard component
const FriendCard = memo(function FriendCard({
  item,
  isRemoving,
  onRemove
}: {
  item: Friend
  isRemoving: boolean
  onRemove: (friendshipId: string, friendUserId: string) => void
}) {
  const router = useRouter()
  const friend = item.friend;
  if (!friend) return null;

  return (
    <div
      onMouseEnter={() => router.prefetch(`/users/${friend.username}`)}
      onClick={() => router.push(`/users/${friend.username}`)}
      className="flex flex-col items-center p-6 glass-panel relative overflow-hidden group cursor-pointer rounded-2xl hover-float border border-white/10"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/users/${friend.username}`)
        }
      }}
    >
      {/* Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-[inherit] p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" style={{background: 'linear-gradient(to right, var(--color-accent), var(--color-primary))'}} />

      {/* Avatar */}
      <div className="mb-4 relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent bg-muted relative z-10">
          {friend.avatar_url ? (
            <Image src={friend.avatar_url} alt={friend.username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-background">
              <User className="w-8 h-8 text-accent" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center w-full mb-6">
        <div className="hover:underline block mb-1">
          <h3 className="font-bold text-lg truncate text-accent">@{friend.username}</h3>
        </div>

        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[150px]">{friend.city || 'Vasai-Virar'}</span>
        </div>

        {friend.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em] px-2">
            {friend.bio}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full mt-auto">
        <div className="flex-1">
          <button
            className="w-full py-2 px-3 text-sm font-bold rounded-xl transition-colors uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:scale-105"
          >
            View Profile
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.friendshipId, friend.id)
          }}
          disabled={isRemoving}
          className="p-2 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-colors hover:scale-110"
          title="Remove Friend"
        >
          {isRemoving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UserMinus className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
})

export const FriendsClient = memo(function FriendsClient({ initialFriends, incoming, sent, disableAutoFetch = false }: FriendsClientProps) {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Local state for tab, initialized from URL
  const [tab, setTab] = useState(searchParams.get('tab') || 'friends')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Sync tab with URL without triggering server navigation
  const handleTabChange = (t: string) => {
    setTab(t)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', t)
    window.history.replaceState({}, '', url)
  }

  // Queries
  const { data: friendsList } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends(),
    initialData: initialFriends,
    staleTime: 60 * 1000,
    enabled: !disableAutoFetch,
  })

  const { data: requestsData } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => getRequests(),
    initialData: { incoming, sent },
    staleTime: 60 * 1000,
    enabled: !disableAutoFetch,
  })

  const incomingRequests = requestsData?.incoming || []
  const sentRequests = requestsData?.sent || []

  // Mutations
  const removeFriendMutation = useMutation({
    mutationFn: async ({ friendshipId, friendUserId }: { friendshipId: string, friendUserId: string }) => {
        const res = await removeFriend(friendshipId, friendUserId);
        if (res.error) throw new Error(res.error);
        return res;
    },
    onMutate: async ({ friendshipId }) => {
        setProcessingId(friendshipId)
        await queryClient.cancelQueries({ queryKey: ['friends'] })
        const previousFriends = queryClient.getQueryData(['friends'])
        queryClient.setQueryData(['friends'], (old: any[]) => old?.filter(f => f.friendshipId !== friendshipId))
        return { previousFriends }
    },
    onError: (err, variables, context) => {
        queryClient.setQueryData(['friends'], context?.previousFriends)
        toast.error(err.message || "Failed to remove friend")
    },
    onSuccess: () => {
        toast.success("Friend removed")
        queryClient.invalidateQueries({ queryKey: ['friends'] })
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onSettled: () => setProcessingId(null)
  })

  const acceptRequestMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await acceptFriendRequest(id)
        if (res.error) throw new Error(res.error)
        return res
    },
    onMutate: async (id) => {
        setProcessingId(id)
        await queryClient.cancelQueries({ queryKey: ['friend-requests'] })
        const previousRequests = queryClient.getQueryData(['friend-requests'])

        queryClient.setQueryData(['friend-requests'], (old: any) => ({
            ...old,
            incoming: old?.incoming?.filter((r: any) => r.id !== id)
        }))

        return { previousRequests }
    },
    onError: (err, variables, context) => {
        queryClient.setQueryData(['friend-requests'], context?.previousRequests)
        toast.error(err.message || "Failed to accept request")
    },
    onSuccess: () => {
        toast.success("Friend request accepted")
        queryClient.invalidateQueries({ queryKey: ['friends'] })
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onSettled: () => setProcessingId(null)
  })

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await rejectFriendRequest(id)
        if (res.error) throw new Error(res.error)
        return res
    },
    onMutate: async (id) => {
        setProcessingId(id)
        await queryClient.cancelQueries({ queryKey: ['friend-requests'] })
        const previousRequests = queryClient.getQueryData(['friend-requests'])

        queryClient.setQueryData(['friend-requests'], (old: any) => ({
            ...old,
            incoming: old?.incoming?.filter((r: any) => r.id !== id)
        }))

        return { previousRequests }
    },
    onError: (err, variables, context) => {
        queryClient.setQueryData(['friend-requests'], context?.previousRequests)
        toast.error(err.message || "Failed to reject request")
    },
    onSuccess: () => {
        toast.success("Friend request rejected")
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onSettled: () => setProcessingId(null)
  })

  const cancelRequestMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await cancelFriendRequest(id)
        if (res.error) throw new Error(res.error)
        return res
    },
    onMutate: async (id) => {
        setProcessingId(id)
        await queryClient.cancelQueries({ queryKey: ['friend-requests'] })
        const previousRequests = queryClient.getQueryData(['friend-requests'])

        queryClient.setQueryData(['friend-requests'], (old: any) => ({
            ...old,
            sent: old?.sent?.filter((r: any) => r.id !== id)
        }))

        return { previousRequests }
    },
    onError: (err, variables, context) => {
        queryClient.setQueryData(['friend-requests'], context?.previousRequests)
        toast.error(err.message || "Failed to cancel request")
    },
    onSuccess: () => {
        toast.success("Request cancelled")
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onSettled: () => setProcessingId(null)
  })

  // Handlers
  const handleRemoveFriend = useCallback((friendshipId: string, friendUserId: string) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
        removeFriendMutation.mutate({ friendshipId, friendUserId })
    }
  }, [removeFriendMutation])

  return (
    <>
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-8 gap-4">
          <div className="flex bg-cyber-dark/50 p-1 rounded-xl border border-cyber-gray/30">
            <button
              onClick={() => handleTabChange('friends')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                tab === 'friends'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Friends ({friendsList?.length || 0})
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                tab === 'requests'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Requests ({incomingRequests.length})
            </button>
            <button
              onClick={() => handleTabChange('sent')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                tab === 'sent'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan'
                  : 'text-cyber-gray hover:text-cyber-light'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tab === 'friends' && (
             (friendsList && friendsList.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friendsList.map((item: Friend) => (
                    <FriendCard
                      key={item.friendshipId}
                      item={item}
                      isRemoving={processingId === item.friendshipId}
                      onRemove={handleRemoveFriend}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-[#E8FF00]/30 rounded-2xl bg-[#0A0E27]/50">
                  <p className="text-[#00D9FF] text-lg mb-4">No friends yet</p>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">Start connecting with other explorers in Vasai-Virar to see their activity and discoveries!</p>
                  <Link href="/dashboard">
                    <CyberButton className="rounded-xl">Explore Hotspots</CyberButton>
                  </Link>
                </div>
              )
          )}

          {tab === 'requests' && (
            incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests.map((req: any) => (
                  <div key={req.id} className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-primary rounded-2xl hover:border-white/20 transition-colors">
                    <div
                      onMouseEnter={() => router.prefetch(`/users/${req.sender.username}`)}
                      onClick={() => router.push(`/users/${req.sender.username}`)}
                      className="block flex-shrink-0 cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/users/${req.sender.username}`)
                        }
                      }}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary bg-muted relative">
                        {req.sender?.avatar_url ? (
                          <Image src={req.sender.avatar_url} alt={req.sender.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs text-primary uppercase tracking-wider">Request Received</span>
                         <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(req.created_at))} ago</span>
                      </div>
                      <div
                        onMouseEnter={() => router.prefetch(`/users/${req.sender.username}`)}
                        onClick={() => router.push(`/users/${req.sender.username}`)}
                        className="hover:underline cursor-pointer"
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            router.push(`/users/${req.sender.username}`)
                          }
                        }}
                      >
                        <h3 className="font-bold text-foreground text-lg">@{req.sender?.username}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <CyberButton
                        variant="ghost"
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => acceptRequestMutation.mutate(req.id)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                        Accept
                      </CyberButton>
                      <CyberButton
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => rejectRequestMutation.mutate(req.id)}
                        disabled={processingId === req.id}
                      >
                        <X className="w-4 h-4" />
                      </CyberButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                <p className="text-cyber-gray font-mono">No pending friend requests.</p>
              </div>
            )
          )}

          {tab === 'sent' && (
            sentRequests.length > 0 ? (
              <div className="space-y-4">
                {sentRequests.map((req: any) => (
                  <div key={req.id} className="glass-panel p-4 flex items-center gap-4 opacity-80 rounded-2xl hover:opacity-100 transition-opacity">
                    <div
                      onMouseEnter={() => router.prefetch(`/users/${req.receiver.username}`)}
                      onClick={() => router.push(`/users/${req.receiver.username}`)}
                      className="block flex-shrink-0 cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/users/${req.receiver.username}`)}
                      }}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-muted-foreground bg-muted relative">
                        {req.receiver?.avatar_url ? (
                          <Image src={req.receiver.avatar_url} alt={req.receiver.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs text-muted-foreground uppercase tracking-wider">Request Sent</span>
                         <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(req.created_at))} ago</span>
                      </div>
                      <div
                        onMouseEnter={() => router.prefetch(`/users/${req.receiver.username}`)}
                        onClick={() => router.push(`/users/${req.receiver.username}`)}
                        className="hover:underline cursor-pointer"
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            router.push(`/users/${req.receiver.username}`)
                          }
                        }}
                      >
                        <h3 className="font-bold text-foreground">@{req.receiver?.username}</h3>
                      </div>
                    </div>
                    <CyberButton
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:border-destructive"
                      onClick={() => cancelRequestMutation.mutate(req.id)}
                      disabled={processingId === req.id}
                    >
                      {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel"}
                    </CyberButton>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                <p className="text-cyber-gray font-mono">No sent requests pending.</p>
              </div>
            )
          )}
        </div>
    </>
  )
})
