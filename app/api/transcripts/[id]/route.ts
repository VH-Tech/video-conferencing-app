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

    // Fetch transcript info from Daily.co
    const infoResponse = await fetch(`https://api.daily.co/v1/transcript/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    })

    if (!infoResponse.ok) {
      const error = await infoResponse.json()
      console.error('Error fetching transcript info:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transcript' },
        { status: infoResponse.status }
      )
    }

    const transcriptInfo = await infoResponse.json()

    // Check if user owns this room
    const { data: room } = await supabase
      .from('rooms')
      .select('creator_id')
      .eq('room_name', transcriptInfo.roomName)
      .single()

    if (room && room.creator_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch the download link
    const linkResponse = await fetch(
      `https://api.daily.co/v1/transcript/${id}/access-link`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    )

    if (!linkResponse.ok) {
      const error = await linkResponse.json()
      console.error('Error fetching transcript link:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transcript link' },
        { status: linkResponse.status }
      )
    }

    const linkData = await linkResponse.json()

    // Fetch the actual WebVTT content
    let vttContent = null
    if (linkData.link) {
      try {
        const vttResponse = await fetch(linkData.link)
        if (vttResponse.ok) {
          vttContent = await vttResponse.text()
        }
      } catch (error) {
        console.error('Error fetching VTT content:', error)
      }
    }

    return NextResponse.json({
      transcript: transcriptInfo,
      downloadLink: linkData.link,
      vttContent,
    })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
