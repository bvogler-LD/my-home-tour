'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VoteResult {
  id: string
  created_at: string
  voters: { name: string }
  rooms: { name: string }
  layouts: { name: string }
}

interface CommentResult {
  id: string
  text: string
  created_at: string
  voters: { name: string }
  rooms: { name: string }
  layouts: { name: string } | null
}

export default function AdminResultsPage() {
  const router = useRouter()
  const [votes, setVotes] = useState<VoteResult[]>([])
  const [comments, setComments] = useState<CommentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'votes' | 'comments'>('votes')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/results')
      if (res.status === 401) { router.push('/admin'); return }
      if (res.ok) {
        const data = await res.json()
        setVotes(data.votes)
        setComments(data.comments)
      }
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

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="pt-4 mb-6">
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Results</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('votes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'votes' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Votes ({votes.length})
          </button>
          <button
            onClick={() => setTab('comments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'comments' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Comments ({comments.length})
          </button>
        </div>

        {tab === 'votes' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {votes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No votes yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3 font-medium text-gray-500">Person</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Room</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Voted for</th>
                    <th className="px-5 py-3 font-medium text-gray-500">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {votes.map((v) => (
                    <tr key={v.id}>
                      <td className="px-5 py-3 font-medium text-gray-900">{v.voters.name}</td>
                      <td className="px-5 py-3 text-gray-600">{v.rooms.name}</td>
                      <td className="px-5 py-3">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {v.layouts.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-medium text-gray-900">{c.voters.name}</span>
                    <span className="text-xs text-gray-400">{c.rooms.name}</span>
                    {c.layouts && (
                      <span className="text-xs text-gray-400">re: {c.layouts.name}</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{c.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
