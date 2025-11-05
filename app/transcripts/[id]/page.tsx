'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface TranscriptEntry {
  timestamp: string
  speaker: string
  text: string
}

interface TranscriptData {
  transcript: {
    id: string
    room_name: string
    duration: number
    status: string
    created_at: string
  }
  downloadLink: string
}

export default function TranscriptViewerPage() {
  const params = useParams()
  const router = useRouter()
  const transcriptId = params.id as string

  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null)
  const [entries, setEntries] = useState<TranscriptEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        // Fetch transcript metadata and download link
        const response = await fetch(`/api/transcripts/${transcriptId}`)

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch transcript')
        }

        const data = await response.json()
        setTranscriptData(data)

        // Parse the WebVTT content from the API response
        if (data.vttContent) {
          const parsed = parseWebVTT(data.vttContent)
          setEntries(parsed)
        }
      } catch (err) {
        console.error('Error fetching transcript:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transcript')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [transcriptId, router])

  const parseWebVTT = (vttText: string): TranscriptEntry[] => {
    const lines = vttText.split('\n')
    const entries: TranscriptEntry[] = []
    let currentEntry: Partial<TranscriptEntry> = {}

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip WEBVTT header, transcript IDs, and empty lines
      if (line === '' || line.startsWith('WEBVTT') || line.startsWith('NOTE') || line.startsWith('transcript:')) {
        continue
      }

      // Check if line is a timestamp
      if (line.includes('-->')) {
        const timestamp = line.split('-->')[0].trim()
        currentEntry.timestamp = timestamp
      }
      // Check if line contains speaker info (format: <v>Speaker:</v>Text or <v Speaker>Text)
      else if (line.includes('<v>') || line.startsWith('<v ')) {
        // Handle format: <v>speaker:</v>text
        const format1Match = line.match(/<v>([^<]+):<\/v>(.*)/)
        if (format1Match) {
          currentEntry.speaker = format1Match[1].trim()
          currentEntry.text = format1Match[2].trim()

          if (currentEntry.timestamp && currentEntry.speaker && currentEntry.text) {
            entries.push(currentEntry as TranscriptEntry)
            currentEntry = {}
          }
        } else {
          // Handle format: <v Speaker>text
          const format2Match = line.match(/<v ([^>]+)>(.*)/)
          if (format2Match) {
            currentEntry.speaker = format2Match[1].trim()
            currentEntry.text = format2Match[2].trim()

            if (currentEntry.timestamp && currentEntry.speaker && currentEntry.text) {
              entries.push(currentEntry as TranscriptEntry)
              currentEntry = {}
            }
          }
        }
      }
      // Plain text without speaker tag
      else if (currentEntry.timestamp && line && !line.includes('<v')) {
        currentEntry.speaker = currentEntry.speaker || 'Unknown'
        currentEntry.text = (currentEntry.text || '') + ' ' + line

        if (currentEntry.timestamp && currentEntry.text) {
          entries.push(currentEntry as TranscriptEntry)
          currentEntry = {}
        }
      }
    }

    return entries
  }

  const exportAsText = () => {
    if (!entries.length) return

    const text = entries
      .map((entry) => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
      .join('\n\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${transcriptData?.transcript.roomName}-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsJSON = () => {
    if (!entries.length) return

    const json = JSON.stringify(
      {
        roomName: transcriptData?.transcript.roomName,
        mtgSessionId: transcriptData?.transcript.mtgSessionId,
        entries,
      },
      null,
      2
    )

    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${transcriptData?.transcript.roomName}-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadWebVTT = () => {
    if (transcriptData?.downloadLink) {
      window.open(transcriptData.downloadLink, '_blank')
    }
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link
                href="/transcripts"
                className="text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1"
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
              <h1 className="text-3xl font-bold text-gray-900">
                {transcriptData?.transcript.roomName}
              </h1>
              <p className="mt-2 text-gray-600">
                Session: {transcriptData?.transcript.mtgSessionId}
              </p>
            </div>
          </div>

          {/* Search and Export */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportAsText}
                disabled={entries.length === 0}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export TXT
              </button>
              <button
                onClick={exportAsJSON}
                disabled={entries.length === 0}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export JSON
              </button>
              <button
                onClick={downloadWebVTT}
                disabled={!transcriptData?.downloadLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download WebVTT
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm
                ? 'No results found for your search.'
                : 'No transcript entries available.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEntries.map((entry, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      {entry.timestamp}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {entry.speaker}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
