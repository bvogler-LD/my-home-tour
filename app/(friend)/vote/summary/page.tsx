'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VoteWithDetails {
  id: string
  room_id: string
  layout_id: string
  created_at: string
  layouts: {
    name: string
    rooms: { name: string }
  }
}

export default function SummaryPage() {
  const router = useRouter()
  const [votes, setVotes] = useState<VoteWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/votes')
      if (res.status === 401) {
        router.push('/')
        return
      }
      if (res.ok) setVotes(await res.json())
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="pt-4 mb-6">
          <Link href="/vote" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to rooms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Your Votes</h1>
          <p className="text-gray-500 mt-1">A summary of all your selections</p>
        </div>

        {votes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">You haven&apos;t voted on any rooms yet.</p>
            <Link href="/vote" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
              Start voting →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {votes.map((vote) => (
              <Link
                key={vote.id}
                href={`/vote/${vote.room_id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Room</p>
                    <h2 className="font-semibold text-gray-900">{vote.layouts.rooms.name}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your pick</p>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {vote.layouts.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
