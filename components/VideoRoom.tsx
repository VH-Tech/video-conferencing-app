'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { useRouter } from 'next/navigation'

interface VideoRoomProps {
  roomUrl: string
}

export default function VideoRoom({ roomUrl }: VideoRoomProps) {
  const callFrameRef = useRef<DailyCall | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isJoining, setIsJoining] = useState(false)
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
        setIsJoining(true)
        setError(null)

        // Destroy any existing Daily instances before creating a new one
        const existingFrames = DailyIframe.getCallInstance()
        if (existingFrames) {
          existingFrames.destroy()
        }

        // Create the Daily call frame
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

        // Join the call only if component is still mounted
        if (mounted) {
          await callFrame.join({ url: roomUrl })
          setIsJoining(false)
        }
      } catch (err) {
        console.error('Error joining call:', err)
        if (mounted) {
          setError('Failed to join the call. Please try again.')
          setIsJoining(false)
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
  }, [roomUrl])

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

  if (isJoining) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Joining call...</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
