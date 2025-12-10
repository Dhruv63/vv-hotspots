import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const subscription = await request.json()

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
        }

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Insert or ignore if duplicate (handled by UNIQUE constraint but we want to update if needed, usually just insert)
        // Actually our unique constraint is (user_id, endpoint).
        const { error } = await supabase.from("push_subscriptions").upsert(
            {
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            { onConflict: "user_id, endpoint" },
        )

        if (error) {
            console.error("Error saving subscription:", error)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in subscribe route:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { endpoint } = await request.json()

        if (!endpoint) {
            return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
        }

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { error } = await supabase
            .from("push_subscriptions")
            .delete()
            .match({ user_id: user.id, endpoint })

        if (error) {
            console.error("Error deleting subscription:", error)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in unsubscribe route:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
