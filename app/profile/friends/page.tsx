import { createClient } from "@/lib/supabase/server"
import { getFriends, getRequests } from "@/app/actions/friends"
import { redirect } from "next/navigation"
import dynamic from 'next/dynamic'

const FriendsClient = dynamic(() => import('./friends-client').then(mod => mod.FriendsClient), {
  loading: () => <div className="animate-pulse p-4 text-cyber-cyan">Loading friends...</div>
})

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [friends, { incoming, sent }] = await Promise.all([
    getFriends(),
    getRequests()
  ])

  return (
    <FriendsClient
      initialFriends={friends}
      incoming={incoming}
      sent={sent}
      userId={user.id}
      user={user}
    />
  )
}
