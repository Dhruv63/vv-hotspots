"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowLeft, UserMinus, Check, X, UserX, Clock, User } from "lucide-react"
import { toast } from "sonner"
import { removeFriend, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest } from "@/app/actions/friends"
import { formatDistanceToNow } from "date-fns"

interface FriendsClientProps {
  initialFriends: any[]
  initialRequests: any[]
  initialSent: any[]
  userId: string
}

export function FriendsClient({ initialFriends, initialRequests, initialSent, userId }: FriendsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') || 'friends'
  const [loadingId, setLoadingId] = useState<string | null>(null)

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
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      <Navbar />

      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
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
              Friends ({initialFriends.length})
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
            initialFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialFriends.map((friend) => (
                  <CyberCard key={friend.id} className="p-4 flex items-center gap-4">
                    <Link href={`/users/${friend.username}`} className="block flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyber-cyan bg-cyber-dark relative">
                        {friend.avatar_url ? (
                          <Image src={friend.avatar_url} alt={friend.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-cyber-cyan" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/users/${friend.username}`} className="hover:underline">
                        <h3 className="font-bold text-cyber-light truncate">@{friend.username}</h3>
                      </Link>
                      <p className="text-xs text-cyber-gray flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {friend.city || 'Vasai-Virar'}
                      </p>
                    </div>
                    <CyberButton
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleAction(removeFriend, friend.id, "Friend removed", friend.id)}
                      disabled={loadingId === friend.id}
                    >
                      <UserMinus className="w-4 h-4" />
                    </CyberButton>
                  </CyberCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                <p className="text-cyber-gray font-mono mb-4">You haven't added any friends yet.</p>
                <Link href="/dashboard">
                  <CyberButton>Explore Hotspots</CyberButton>
                </Link>
              </div>
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
