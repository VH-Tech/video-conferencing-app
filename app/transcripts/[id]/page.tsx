'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface TranscriptData {
  id: string
  transcript_id: string
  room_name: string
  meeting_date: string
  duration: number
  status: string
  created_at: string
  updated_at: string
  content?: string
  title?: string
  description?: string
  executive_summary?: string
  key_points?: string[]
  important_numbers?: string[]
  action_items?: string[]
  speaker_insights?: string
  questions_raised?: string[]
  open_questions?: string[]
}

export default function TranscriptViewerPage() {
  const params = useParams()
  const router = useRouter()
  const transcriptId = params.id as string

  const [transcript, setTranscript] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'briefing' | 'transcript'>('briefing')

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch(`/api/transcripts/${transcriptId}`)

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch transcript')
        }

        const data = await response.json()
        setTranscript(data.transcript)
      } catch (err) {
        console.error('Error fetching transcript:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transcript')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [transcriptId, router])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const exportBriefingAsText = () => {
    if (!transcript) return

    let text = `Meeting Briefing\n\n`
    text += `Title: ${transcript.title || 'N/A'}\n`
    text += `Room: ${transcript.room_name}\n`
    text += `Date: ${formatDate(transcript.meeting_date || transcript.created_at)}\n`
    text += `Duration: ${formatDuration(transcript.duration)}\n\n`
    
    if (transcript.description) {
      text += `Description:\n${transcript.description}\n\n`
    }
    
    if (transcript.executive_summary) {
      text += `Executive Summary:\n${transcript.executive_summary}\n\n`
    }
    
    if (transcript.key_points && transcript.key_points.length > 0) {
      text += `Key Points:\n${transcript.key_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n`
    }
    
    if (transcript.action_items && transcript.action_items.length > 0) {
      text += `Action Items:\n${transcript.action_items.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n`
    }
    
    if (transcript.important_numbers && transcript.important_numbers.length > 0) {
      text += `Important Numbers:\n${transcript.important_numbers.map((num, i) => `${i + 1}. ${num}`).join('\n')}\n\n`
    }
    
    if (transcript.questions_raised && transcript.questions_raised.length > 0) {
      text += `Questions Raised:\n${transcript.questions_raised.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`
    }
    
    if (transcript.open_questions && transcript.open_questions.length > 0) {
      text += `Open Questions:\n${transcript.open_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`
    }
    
    if (transcript.speaker_insights) {
      text += `Speaker Insights:\n${transcript.speaker_insights}\n\n`
    }

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `briefing-${transcript.room_name}-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportTranscriptAsText = () => {
    if (!transcript?.content) return

    const blob = new Blob([transcript.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${transcript.room_name}-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transcript...</p>
        </div>
      </div>
    )
  }

  if (error || !transcript) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error || 'Transcript not found'}</p>
          <Link
            href="/transcripts"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Transcripts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/transcripts"
            className="text-blue-600 hover:text-blue-700 mb-3 inline-flex items-center gap-1"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Transcripts
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {transcript.title || transcript.room_name}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(transcript.meeting_date || transcript.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(transcript.duration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('briefing')}
                className={`${
                  activeTab === 'briefing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Meeting Briefing
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`${
                  activeTab === 'transcript'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Raw Transcript
              </button>
            </nav>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={activeTab === 'briefing' ? exportBriefingAsText : exportTranscriptAsText}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Export {activeTab === 'briefing' ? 'Briefing' : 'Transcript'}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {activeTab === 'briefing' ? (
            <div className="p-8 space-y-6">
              {transcript.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{transcript.description}</p>
                </div>
              )}

              {transcript.executive_summary && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-blue-900 mb-3">Executive Summary</h2>
                  <p className="text-blue-800 leading-relaxed">{transcript.executive_summary}</p>
                </div>
              )}

              {transcript.key_points && transcript.key_points.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Key Points</h2>
                  <ul className="space-y-2">
                    {transcript.key_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transcript.action_items && transcript.action_items.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Action Items</h2>
                  <ul className="space-y-2">
                    {transcript.action_items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transcript.important_numbers && transcript.important_numbers.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Numbers</h2>
                  <ul className="space-y-2">
                    {transcript.important_numbers.map((number, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <span className="text-gray-700">{number}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transcript.questions_raised && transcript.questions_raised.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Questions Raised</h2>
                  <ul className="space-y-2">
                    {transcript.questions_raised.map((question, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transcript.open_questions && transcript.open_questions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Open Questions</h2>
                  <ul className="space-y-2">
                    {transcript.open_questions.map((question, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transcript.speaker_insights && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Speaker Insights</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{transcript.speaker_insights}</p>
                </div>
              )}

              {!transcript.executive_summary && !transcript.key_points && !transcript.action_items && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No briefing data available for this transcript yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8">
              {transcript.content ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                    {transcript.content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No raw transcript content available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
