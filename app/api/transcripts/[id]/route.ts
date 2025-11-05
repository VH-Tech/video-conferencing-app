import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Fetch transcript from our database with all briefing fields
    const { data: dbTranscript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('transcript_id', id)
      .single()

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError)
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // Check if user owns this room
    const { data: room } = await supabase
      .from('rooms')
      .select('creator_id')
      .eq('room_name', dbTranscript.room_name)
      .single()

    if (room && room.creator_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      transcript: dbTranscript
    })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
