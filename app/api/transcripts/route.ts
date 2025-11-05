import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch user's rooms from Supabase
    const { data: userRooms, error: dbError } = await supabase
      .from('rooms')
      .select('room_name')
      .eq('creator_id', user.id)

    if (dbError) {
      console.error('Error fetching user rooms:', dbError)
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }

    const roomNames = userRooms?.map((r) => r.room_name) || []

    if (roomNames.length === 0) {
      return NextResponse.json({ transcripts: [] })
    }

    // Fetch transcripts from Supabase database
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('id, transcript_id, room_name, meeting_date, duration, status, created_at, updated_at, title, description, executive_summary')
      .in('room_name', roomNames)
      .order('created_at', { ascending: false })

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError)
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transcripts: transcripts || [] })
  } catch (error) {
    console.error('Error fetching transcripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    )
  }
}
