import { createClient } from "@/lib/supabase/server"
import { fetchFriends, getFriendRequests, getSentRequests } from "@/app/actions/friends"
import { FriendsClient } from "./friends-client"
import { redirect } from "next/navigation"

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Use fetchFriends directly (no args)
  const friends = await fetchFriends()
  const requests = await getFriendRequests(user.id)
  const sent = await getSentRequests(user.id)

  return (
    <FriendsClient
      initialFriends={friends}
      initialRequests={requests}
      initialSent={sent}
      userId={user.id}
      user={user}
    />
  )
}
