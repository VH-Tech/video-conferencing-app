import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('Received Daily.co webhook - Full payload:', JSON.stringify(body, null, 2))

    const { type, payload } = body

    // Handle transcript.ready-to-download event
    if (type === 'transcript.ready-to-download') {
      const { room_name, id, mtg_session_id, duration } = payload || {}

      if (!room_name || !id) {
        console.error('Missing required fields in webhook payload')
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
      }

      console.log('Transcript ready:', { room_name, transcript_id: id, mtg_session_id, duration })

      // Fetch transcript details from Daily.co to get full metadata
      const transcriptResponse = await fetch(
        `https://api.daily.co/v1/transcript/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          },
        }
      )

      if (!transcriptResponse.ok) {
        console.error('Failed to fetch transcript details from Daily.co')
        return NextResponse.json({ received: true })
      }

      const transcriptData = await transcriptResponse.json()

      console.log('Transcript details:', {
        transcriptId: transcriptData.transcriptId,
        status: transcriptData.status,
        roomName: transcriptData.roomName,
      })

      // Fetch the transcript download link
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

      let transcriptContent = null
      if (linkResponse.ok) {
        const linkData = await linkResponse.json()

        // Download the actual WebVTT content
        if (linkData.link) {
          try {
            const vttResponse = await fetch(linkData.link)
            if (vttResponse.ok) {
              transcriptContent = await vttResponse.text()
              console.log('Successfully downloaded transcript content')
            } else {
              console.error('Failed to download VTT content:', vttResponse.status)
            }
          } catch (error) {
            console.error('Error downloading VTT content:', error)
          }
        }
      } else {
        console.error('Failed to fetch transcript access link:', linkResponse.status)
      }

      // Duration is already in seconds from the webhook payload
      const durationInSeconds = duration ? Math.round(duration) : null

      // Save transcript metadata and content to Supabase using service role client
      // (bypasses RLS since webhooks don't have user authentication)
      // Use upsert to handle cases where transcript already exists
      const supabase = createServiceRoleClient()

      const { error: upsertError } = await supabase
        .from('transcripts')
        .upsert(
          {
            transcript_id: id,
            room_name: room_name,
            meeting_date: new Date().toISOString(),
            duration: durationInSeconds ? `${durationInSeconds} seconds` : null,
            status: 'finished',
            content: transcriptContent,
          },
          {
            onConflict: 'transcript_id',
          }
        )

      if (upsertError) {
        console.error('Error saving transcript to database:', upsertError)
        // Don't fail the webhook - just log it
      } else {
        console.log('Successfully saved transcript metadata for room:', room_name)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
