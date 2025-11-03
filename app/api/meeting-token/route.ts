import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { roomName } = await request.json()

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
    }

    // Check if user is the room creator
    const { data: roomData, error: dbError } = await supabase
      .from('rooms')
      .select('creator_id')
      .eq('room_name', roomName)
      .single()

    // Determine if user is owner (creator) - default to false if room not found
    const isOwner = roomData?.creator_id === user.id

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is okay
      console.error('Error checking room creator:', dbError)
    }

    // Create a meeting token with appropriate permissions
    const response = await fetch(
      `https://api.daily.co/v1/meeting-tokens`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            is_owner: isOwner,
            user_name: user.email?.split('@')[0] || 'Guest',
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Error creating meeting token:', data)
      return NextResponse.json(
        { error: data.error || 'Failed to create meeting token' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      token: data.token,
      isOwner: isOwner
    })
  } catch (error) {
    console.error('Error creating meeting token:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting token' },
      { status: 500 }
    )
  }
}
