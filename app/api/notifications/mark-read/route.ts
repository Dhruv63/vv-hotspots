import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_id, mark_all } = body

    if (mark_all) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Mark all as read error:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })

    } else if (notification_id) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Mark as read error:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      })

    } else {
      return NextResponse.json(
        { error: 'notification_id or mark_all required' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
