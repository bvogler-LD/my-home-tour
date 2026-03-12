'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoomWithLayouts } from '@/types'

export default function AdminRoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithLayouts[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function loadRooms() {
    const res = await fetch('/api/admin/rooms')
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (res.ok) setRooms(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadRooms() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, display_order: rooms.length }),
    })
    if (res.ok) {
      setName('')
      setDescription('')
      setShowForm(false)
      await loadRooms()
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this room and all its layouts?')) return
    await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
    await loadRooms()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between pt-4 mb-6">
          <div>
            <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Rooms</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition"
          >
            + Add room
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-3">
            <h2 className="font-semibold text-gray-900">New room</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Living Room"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-gray-700 transition"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-gray-900">{room.name}</h2>
                {room.description && <p className="text-sm text-gray-500">{room.description}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{room.layouts.length} layout{room.layouts.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/rooms/${room.id}`} className="text-sm text-blue-600 hover:underline">
                  Manage layouts
                </Link>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <p className="text-gray-500 text-center py-8">No rooms yet. Add one above.</p>
          )}
        </div>
      </div>
    </main>
  )
}
