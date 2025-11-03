'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { useRouter } from 'next/navigation'

interface VideoRoomProps {
  roomUrl: string
  meetingToken?: string | null
  isOwner?: boolean
}

export default function VideoRoom({ roomUrl, meetingToken, isOwner = false }: VideoRoomProps) {
  const callFrameRef = useRef<DailyCall | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!roomUrl || !containerRef.current) return

    // Prevent duplicate instances
    if (callFrameRef.current) {
      return
    }

    let mounted = true

    const joinCall = async () => {
      try {
        setError(null)

        console.log('Starting to join call with URL:', roomUrl)

        // Destroy any existing Daily instances before creating a new one
        const existingFrames = DailyIframe.getCallInstance()
        if (existingFrames) {
          console.log('Destroying existing frame')
          existingFrames.destroy()
        }

        // Create the Daily call frame
        console.log('Creating Daily call frame')
        const callFrame = DailyIframe.createFrame(containerRef.current!, {
          showLeaveButton: true,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
        })

        callFrameRef.current = callFrame
        console.log('Call frame created successfully')

        // Listen for when user leaves the call - redirect immediately
        callFrame.on('left-meeting', async () => {
          // Destroy the frame immediately to prevent "you've left" screen
          if (callFrameRef.current) {
            callFrameRef.current.destroy()
            callFrameRef.current = null
          }
          // Redirect to home
          router.push('/')
        })

        // Listen for transcription lifecycle events (for logging only)
        callFrame.on('transcription-started', () => {
          console.log('Transcription started successfully')
        })

        callFrame.on('transcription-stopped', () => {
          console.log('Transcription stopped')
        })

        callFrame.on('transcription-error', (event) => {
          console.error('Transcription error:', event)
        })

        // Join the call only if component is still mounted
        if (mounted) {
          console.log('Attempting to join call...')
          const joinOptions = meetingToken
            ? { url: roomUrl, token: meetingToken }
            : { url: roomUrl }
          await callFrame.join(joinOptions)
          console.log('Successfully joined call!')

          // Auto-start transcription after joining (only if owner)
          if (isOwner) {
            try {
              console.log('Starting transcription automatically (owner)...')
              await callFrame.startTranscription()
            } catch (err) {
              console.error('Failed to auto-start transcription:', err)
              // Don't set error state, just log it - transcription is optional
            }
          } else {
            console.log('Not starting transcription - user is not room owner')
          }
        }
      } catch (err) {
        console.error('Error joining call:', err)
        if (mounted) {
          setError(`Failed to join the call: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
    }

    joinCall()

    // Cleanup on unmount
    return () => {
      mounted = false
      if (callFrameRef.current) {
        callFrameRef.current.destroy()
        callFrameRef.current = null
      }
    }
  }, [roomUrl, meetingToken, isOwner, router])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
