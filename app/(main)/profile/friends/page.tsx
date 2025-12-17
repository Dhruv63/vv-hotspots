import { Suspense } from 'react'
import { createClient } from "@/lib/supabase/server"
import { getFriends, getRequests } from "@/app/actions/friends"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import dynamic from 'next/dynamic'

const FriendsClient = dynamic(() => import('./friends-client').then(mod => ({ default: mod.FriendsClient })))

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-cyber-black scanlines pointer-events-auto">
      <Navbar user={user} />

      <main className="pt-20 pb-12 px-4 max-w-6xl mx-auto">
        <Link href="/profile" className="inline-flex items-center gap-2 text-cyber-cyan hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back to Profile</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold font-mono text-cyber-light">Friends & Requests</h1>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <FriendsContent />
        </Suspense>
      </main>
    </div>
  )
}

async function FriendsContent() {
  const [friends, { incoming, sent }] = await Promise.all([
    getFriends(),
    getRequests()
  ])

  return (
    <FriendsClient
      initialFriends={friends}
      incoming={incoming}
      sent={sent}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-8">
         <div className="flex bg-gray-800/50 p-1 rounded-lg border border-gray-700/30 gap-2">
            <div className="h-9 w-24 bg-gray-800 animate-pulse rounded" />
            <div className="h-9 w-24 bg-gray-800 animate-pulse rounded" />
            <div className="h-9 w-24 bg-gray-800 animate-pulse rounded" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-gray-900/50 border border-gray-800 rounded-xl animate-pulse relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent" />
             <div className="p-6 flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-gray-800 mb-4" />
                <div className="h-4 w-32 bg-gray-800 rounded mb-2" />
                <div className="h-3 w-20 bg-gray-800 rounded mb-6" />
                <div className="flex gap-3 w-full mt-auto">
                   <div className="h-9 flex-1 bg-gray-800 rounded" />
                   <div className="h-9 w-9 bg-gray-800 rounded" />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
