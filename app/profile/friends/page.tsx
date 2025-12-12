import { createClient } from "@/lib/supabase/server"
import { getFriends, getRequests } from "@/app/actions/friends"
import { FriendsClient } from "./friends-client"
import { redirect } from "next/navigation"

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

// Force rebuild v2
