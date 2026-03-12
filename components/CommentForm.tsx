'use client'

import { useState } from 'react'

interface CommentFormProps {
  roomId: string
  layoutId?: string
  onSubmit: (text: string) => Promise<void>
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(text)
      setText('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Leave a comment about this room..."
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-gray-700 transition"
        >
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
        {submitted && <span className="text-sm text-green-600">Comment posted!</span>}
      </div>
    </form>
  )
}
