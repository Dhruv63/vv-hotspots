import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notification_id, mark_all } = body

    console.log('📥 Mark-read request:', { notification_id, mark_all, user_id: user.id })

    if (mark_all) {
      // Mark all notifications as read
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .select()

      if (error) {
        console.error('❌ Mark all as read error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      console.log('✅ Marked all as read:', data?.length)
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        count: data?.length || 0
      })

    } else if (notification_id) {
      // Mark single notification as read
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Mark as read error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      console.log('✅ Marked as read:', data)
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        notification: data
      })

    } else {
      console.error('❌ Missing notification_id or mark_all')
      return NextResponse.json(
        { success: false, error: 'notification_id or mark_all required' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('❌ API exception:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
