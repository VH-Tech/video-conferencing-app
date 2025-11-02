'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roomName, setRoomName] = useState('')
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingRoom(true)
    setError(null)

    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomName || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create room')
        return
      }

      // Navigate to the room
      router.push(`/room/${data.room.name}`)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setCreatingRoom(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center space-y-8 p-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Video Conferencing
            </h1>
            <p className="text-lg text-gray-600">
              Secure video calls with Daily.co
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full py-3 px-4 rounded-md text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Video Conferencing
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create or Join a Room
          </h2>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="room-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Room Name (optional)
              </label>
              <input
                id="room-name"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Leave empty for random name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Create a custom room name or leave empty for a random one
              </p>
            </div>

            <button
              type="submit"
              disabled={creatingRoom}
              className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingRoom ? 'Creating Room...' : 'Create Room'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Have a room URL?
            </h3>
            <p className="text-sm text-gray-600">
              If someone shared a room URL with you, just paste it in your
              browser to join.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
