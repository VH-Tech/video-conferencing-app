'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Transcript {
  id: string
  transcript_id: string
  room_name: string
  meeting_date: string
  duration: number
  status: string
  created_at: string
  updated_at: string
  title?: string
  description?: string
  executive_summary?: string
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch('/api/transcripts')

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch transcripts')
        }

        const data = await response.json()
        setTranscripts(data.transcripts || [])
      } catch (err) {
        console.error('Error fetching transcripts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transcripts')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscripts()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      t_finished: 'bg-green-100 text-green-800',
      finished: 'bg-green-100 text-green-800',
      t_processing: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-yellow-100 text-yellow-800',
      t_error: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800',
    }

    const color = statusColors[status] || 'bg-gray-100 text-gray-800'
    const displayStatus = status.replace('t_', '').charAt(0).toUpperCase() + status.replace('t_', '').slice(1)

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {displayStatus}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transcripts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Transcripts</h1>
              <p className="mt-2 text-gray-600">
                View briefings and transcripts from your past meetings
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Transcripts List */}
        {transcripts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No transcripts yet</h3>
            <p className="mt-2 text-gray-500">
              Start a meeting with transcription enabled to see transcripts here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transcripts.map((transcript) => (
              <Link
                key={transcript.id}
                href={`/transcripts/${transcript.transcript_id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {transcript.title || transcript.room_name}
                    </h3>
                    {getStatusBadge(transcript.status)}
                  </div>
                  
                  {transcript.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {transcript.description}
                    </p>
                  )}
                  
                  {transcript.executive_summary && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Executive Summary</p>
                      <p className="text-sm text-blue-800 line-clamp-3">
                        {transcript.executive_summary}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(transcript.meeting_date || transcript.created_at)}
                    </span>
                    {transcript.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatDuration(transcript.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
