import { createClient } from "@/lib/supabase/server"

export default async function DebugFriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const logs: string[] = []

  logs.push(`Current User ID: ${user?.id}`)

  if (!user) {
    return (
      <div className="p-8 text-white">
        <h1>Not Authenticated</h1>
        <pre>{logs.join('\n')}</pre>
      </div>
    )
  }

  logs.push('Fetching friendships with OR query...')
  // Raw query as requested
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('id, user_id_1, user_id_2, created_at')
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)

  if (friendshipsError) {
      logs.push(`Error fetching friendships: ${friendshipsError.message}`)
  } else {
      logs.push(`Raw friendships count: ${friendships?.length}`)
      logs.push(`Raw data: ${JSON.stringify(friendships)}`)
  }

  // Extract friend list logic
  let extractedFriends: any[] = []
  if (friendships && friendships.length > 0) {
      logs.push('Extracting friend IDs...')
      const friendIds = friendships.map(f =>
        f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
      )
      logs.push(`Found friend IDs: ${JSON.stringify(friendIds)}`)

      logs.push('Fetching profiles for friend IDs...')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', friendIds)

      if (profilesError) {
          logs.push(`Error fetching profiles: ${profilesError.message}`)
      } else {
          logs.push(`Profiles found: ${profiles?.length}`)

           extractedFriends = friendships.map(friendship => {
            const friendId = friendship.user_id_1 === user.id ? friendship.user_id_2 : friendship.user_id_1;
            const profile = profiles?.find(p => p.id === friendId);
            return {
                friendshipId: friendship.id,
                friendId,
                username: profile?.username || 'Unknown',
            };
          });
          logs.push('Extraction complete.')
      }
  } else {
      logs.push('No friendships found to process.')
  }

  return (
    <div className="p-8 space-y-8 bg-slate-900 text-white min-h-screen pt-24">
      <h1 className="text-2xl font-bold text-yellow-400">Debug Friends</h1>

      <section>
        <h2 className="text-xl font-bold mb-2">1. Current User</h2>
        <div className="bg-slate-800 p-4 rounded">
            <p>User ID: <span className="font-mono text-cyan-400">{user.id}</span></p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">2. Raw Friendships Query Result</h2>
        <pre className="bg-slate-800 p-4 rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(friendships, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">3. Extracted Friend List</h2>
        <pre className="bg-slate-800 p-4 rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(extractedFriends, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">4. Console Logs</h2>
        <div className="bg-black p-4 rounded font-mono text-green-400 text-sm">
            {logs.map((log, i) => (
                <div key={i}>&gt; {log}</div>
            ))}
        </div>
      </section>
    </div>
  )
}
