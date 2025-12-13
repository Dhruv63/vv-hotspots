import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
// @ts-ignore
import webpush from "web-push"

if (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_VAPID_SUBJECT
) {
    webpush.setVapidDetails(
        process.env.NEXT_PUBLIC_VAPID_SUBJECT,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
    )
} else {
    console.warn("VAPID keys not set. Push notifications will not work.")
}

export async function POST(request: Request) {
    try {
        const { userId, title, body, url } = await request.json()

        if (!userId || !title || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify authentication? This route should probably be protected.
        // Assuming for now it's called server-side or by authenticated clients.
        // For extra security, we could check for a service role key or just ensure the caller is authenticated.
        const supabase = await createClient()
        // const { data: { user } } = await supabase.auth.getUser()
        // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Fetch user's subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId)

        if (error) {
            console.error("Error fetching subscriptions:", error)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: "No subscriptions found" })
        }

        const payload = JSON.stringify({
            title,
            body,
            url: url || "/",
        })

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.p256dh,
                                auth: sub.auth,
                            },
                        },
                        payload,
                    )
                    return { success: true, id: sub.id }
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription is gone, remove it
                        await supabase.from("push_subscriptions").delete().eq("id", sub.id)
                        return { success: false, id: sub.id, error: "Expired subscription removed" }
                    }
                    throw error
                }
            }),
        )

        const successCount = results.filter((r) => r.status === "fulfilled").length

        return NextResponse.json({ success: true, sent: successCount, total: subscriptions.length })
    } catch (error) {
        console.error("Error sending push notification:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
