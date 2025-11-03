'use client'

import { useEffect, useRef } from 'react'
import { TranscriptMessage } from '@/types/transcription'

interface TranscriptionPanelProps {
  messages: TranscriptMessage[]
  isActive: boolean
  onExport: (format: 'txt' | 'json') => void
}

export default function TranscriptionPanel({
  messages,
  isActive,
  onExport,
}: TranscriptionPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Transcription</h2>
          {isActive && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onExport('txt')}
            disabled={messages.length === 0}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export as text"
          >
            .txt
          </button>
          <button
            onClick={() => onExport('json')}
            disabled={messages.length === 0}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export as JSON"
          >
            .json
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {isActive
              ? 'Waiting for speech...'
              : 'Start transcription to see captions'}
          </div>
        ) : (
          <>
            {messages
              .filter((msg) => msg.isFinal)
              .map((message) => (
                <div
                  key={message.id}
                  className="bg-white rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {message.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {message.text}
                  </p>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Interim Transcript (if any) */}
      {messages.length > 0 && !messages[messages.length - 1].isFinal && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-sm text-blue-900">
              {messages[messages.length - 1].userName}
            </span>
            <span className="text-xs text-blue-600">Speaking...</span>
          </div>
          <p className="text-sm text-blue-700 italic">
            {messages[messages.length - 1].text}
          </p>
        </div>
      )}
    </div>
  )
}
