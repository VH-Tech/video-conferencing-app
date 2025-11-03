'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import VideoRoom from '@/components/VideoRoom'

export default function RoomPage() {
  const params = useParams()
  const roomName = params.roomName as string
  const [meetingToken, setMeetingToken] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeetingToken = async () => {
      try {
        const response = await fetch('/api/meeting-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomName }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get meeting token')
        }

        setMeetingToken(data.token)
        setIsOwner(data.isOwner || false)
      } catch (err) {
        console.error('Error fetching meeting token:', err)
        setError(err instanceof Error ? err.message : 'Failed to join room')
      } finally {
        setLoading(false)
      }
    }

    fetchMeetingToken()
  }, [roomName])

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const roomUrl = `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}.daily.co/${roomName}`

  return (
    <div className="h-screen w-screen bg-gray-900 p-4">
      <VideoRoom roomUrl={roomUrl} meetingToken={meetingToken} isOwner={isOwner} />
    </div>
  )
}
