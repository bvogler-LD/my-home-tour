'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoomWithLayouts } from '@/types'

export default function VotePage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithLayouts[]>([])
  const [votes, setVotes] = useState<Record<string, string>>({}) // roomId -> layoutId
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [roomsRes, votesRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/votes'),
      ])

      if (roomsRes.status === 401) {
        router.push('/')
        return
      }

      const roomsData = await roomsRes.json()
      const votesData = votesRes.ok ? await votesRes.json() : []

      setRooms(roomsData)

      const voteMap: Record<string, string> = {}
      for (const v of votesData) {
        voteMap[v.room_id] = v.layout_id
      }
      setVotes(voteMap)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-500">Loading rooms...</p>
      </main>
    )
  }

  const votedCount = Object.keys(votes).length

  return (
    <main className="min-h-screen bg-stone-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Choose Your Favorites</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {votedCount} of {rooms.length} rooms voted
            </p>
          </div>
          <Link href="/vote/summary" className="text-sm text-blue-600 hover:underline">
            My votes →
          </Link>
        </div>

        <div className="space-y-3">
          {rooms.map((room) => {
            const hasVoted = votes[room.id]
            return (
              <Link
                key={room.id}
                href={`/vote/${room.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{room.name}</h2>
                    {room.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{room.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {room.layouts.length} option{room.layouts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasVoted ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                        Voted
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                        Not voted
                      </span>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
