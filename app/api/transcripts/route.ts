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

    // Fetch all transcripts from Daily.co
    const response = await fetch('https://api.daily.co/v1/transcript', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error fetching transcripts from Daily:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Filter transcripts to only include user's rooms
    const userTranscripts = data.data?.filter((transcript: any) =>
      roomNames.includes(transcript.roomName)
    ) || []

    return NextResponse.json({ transcripts: userTranscripts })
  } catch (error) {
    console.error('Error fetching transcripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    )
  }
}
