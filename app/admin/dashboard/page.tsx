'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoomWithLayouts } from '@/types'

interface Results {
  votes: Array<{ room_id: string; rooms: { name: string } }>
  comments: Array<{ id: string }>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithLayouts[]>([])
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [roomsRes, resultsRes] = await Promise.all([
        fetch('/api/admin/rooms'),
        fetch('/api/admin/results'),
      ])
      if (roomsRes.status === 401) {
        router.push('/admin')
        return
      }
      if (roomsRes.ok) setRooms(await roomsRes.json())
      if (resultsRes.ok) setResults(await resultsRes.json())
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  const totalVotes = results?.votes.length ?? 0
  const totalComments = results?.comments.length ?? 0

  // Count votes per room
  const votesByRoom: Record<string, number> = {}
  results?.votes.forEach((v) => {
    votesByRoom[v.room_id] = (votesByRoom[v.room_id] || 0) + 1
  })

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between pt-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">My Home Tour Admin</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/rooms" className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition">
              Manage rooms
            </Link>
            <Link href="/admin/results" className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
              View results
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{totalVotes}</p>
            <p className="text-sm text-gray-500 mt-1">Total votes</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{totalComments}</p>
            <p className="text-sm text-gray-500 mt-1">Total comments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Rooms</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-500 text-sm">No rooms yet. <Link href="/admin/rooms" className="text-blue-600 hover:underline">Add one →</Link></p>
          ) : (
            <div className="divide-y divide-gray-100">
              {rooms.map((room) => (
                <div key={room.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-xs text-gray-400">
                      {room.layouts.length} layout{room.layouts.length !== 1 ? 's' : ''}
                      {' · '}
                      {votesByRoom[room.id] || 0} vote{votesByRoom[room.id] !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link href={`/admin/rooms/${room.id}`} className="text-sm text-blue-600 hover:underline">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
