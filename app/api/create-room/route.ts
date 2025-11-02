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

    // Create a Daily room
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName || undefined,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: 'cloud',
          enable_advanced_chat: true,
          enable_emoji_reactions: true,
          enable_hand_raising: true,
          enable_breakout_rooms: true,
          enable_pip_ui: true,
          enable_people_ui: true,
          enable_prejoin_ui: true,
          enable_network_ui: true,
          enable_noise_cancellation_ui: true,
          enable_live_captions_ui: true,
          start_video_off: false,
          start_audio_off: false,
          max_participants: 10,
        },
      }),
    })

    const room = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: room.error }, { status: response.status })
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
