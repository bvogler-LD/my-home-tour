'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import LayoutCard from '@/components/LayoutCard'
import CommentForm from '@/components/CommentForm'
import { RoomWithLayouts } from '@/types'

interface Comment {
  id: string
  text: string
  created_at: string
  voters: { name: string }
  layout_id: string | null
}

export default function RoomVotePage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string

  const [room, setRoom] = useState<RoomWithLayouts | null>(null)
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [roomsRes, votesRes, commentsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/votes'),
        fetch(`/api/comments?roomId=${roomId}`),
      ])

      if (roomsRes.status === 401) {
        router.push('/')
        return
      }

      const rooms: RoomWithLayouts[] = await roomsRes.json()
      const found = rooms.find((r) => r.id === roomId)
      if (!found) {
        router.push('/vote')
        return
      }
      setRoom(found)

      const votesData = votesRes.ok ? await votesRes.json() : []
      const existingVote = votesData.find((v: { room_id: string; layout_id: string }) => v.room_id === roomId)
      if (existingVote) setSelectedLayoutId(existingVote.layout_id)

      const commentsData = commentsRes.ok ? await commentsRes.json() : []
      setComments(commentsData)

      setLoading(false)
    }
    load()
  }, [roomId, router])

  async function handleVote() {
    if (!selectedLayoutId) return
    setSaving(true)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutId: selectedLayoutId, roomId }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleComment(text: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, text }),
    })
    if (res.ok) {
      const commentsRes = await fetch(`/api/comments?roomId=${roomId}`)
      if (commentsRes.ok) setComments(await commentsRes.json())
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (!room) return null

  return (
    <main className="min-h-screen bg-stone-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="pt-4 mb-6">
          <Link href="/vote" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to rooms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{room.name}</h1>
          {room.description && <p className="text-gray-500 mt-1">{room.description}</p>}
        </div>

        <div className="space-y-4 mb-8">
          {room.layouts.map((layout) => (
            <LayoutCard
              key={layout.id}
              layout={layout}
              selected={selectedLayoutId === layout.id}
              onSelect={() => setSelectedLayoutId(layout.id)}
            />
          ))}
        </div>

        {room.layouts.length > 0 && (
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={handleVote}
              disabled={!selectedLayoutId || saving}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save vote'}
            </button>
            {saved && <span className="text-sm text-green-600">Vote saved!</span>}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Comments</h2>
          <CommentForm roomId={roomId} onSubmit={handleComment} />
          {comments.length > 0 && (
            <div className="mt-5 space-y-3 pt-4 border-t border-gray-100">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-900">{comment.voters.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
