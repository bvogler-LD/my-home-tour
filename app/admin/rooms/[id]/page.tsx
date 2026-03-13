'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { RoomWithLayouts, Layout } from '@/types'

export default function AdminRoomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<RoomWithLayouts | null>(null)
  const [loading, setLoading] = useState(true)

  // New layout form
  const [showLayoutForm, setShowLayoutForm] = useState(false)
  const [layoutName, setLayoutName] = useState('')
  const [layoutDesc, setLayoutDesc] = useState('')
  const [creating, setCreating] = useState(false)

  // Image upload
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null)

  async function loadRoom() {
    const res = await fetch('/api/admin/rooms')
    if (res.status === 401) { router.push('/admin'); return }
    if (res.ok) {
      const rooms: RoomWithLayouts[] = await res.json()
      const found = rooms.find((r) => r.id === roomId)
      if (!found) { router.push('/admin/rooms'); return }
      setRoom(found)
    }
    setLoading(false)
  }

  useEffect(() => { loadRoom() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreateLayout(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/layouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: roomId,
        name: layoutName,
        description: layoutDesc,
        display_order: room?.layouts.length ?? 0,
      }),
    })
    if (res.ok) {
      setLayoutName('')
      setLayoutDesc('')
      setShowLayoutForm(false)
      await loadRoom()
    }
    setCreating(false)
  }

  async function handleDeleteLayout(id: string) {
    if (!confirm('Delete this layout option?')) return
    await fetch(`/api/admin/layouts/${id}`, { method: 'DELETE' })
    await loadRoom()
  }

  async function handleImageUpload(layoutId: string, file: File) {
    setUploadingFor(layoutId)
    try {
      // Get presigned URL
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!res.ok) { alert('Failed to get upload URL'); return }
      const { presignedUrl, publicUrl } = await res.json()

      // Upload directly to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      // Add URL to layout
      const layout = room?.layouts.find((l) => l.id === layoutId)
      if (!layout) return
      const updatedUrls = [...layout.image_urls, publicUrl]
      await fetch(`/api/admin/layouts/${layoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...layout, image_urls: updatedUrls }),
      })

      await loadRoom()
    } finally {
      setUploadingFor(null)
    }
  }

  async function handleRemoveImage(layout: Layout, url: string) {
    const updatedUrls = layout.image_urls.filter((u) => u !== url)
    await fetch(`/api/admin/layouts/${layout.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...layout, image_urls: updatedUrls }),
    })
    await loadRoom()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (!room) return null

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="pt-4 mb-6">
          <Link href="/admin/rooms" className="text-sm text-gray-500 hover:text-gray-700">
            ← Rooms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{room.name}</h1>
          {room.description && <p className="text-gray-500 text-sm">{room.description}</p>}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Layout Options</h2>
          <button
            onClick={() => setShowLayoutForm(!showLayoutForm)}
            className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition"
          >
            + Add option
          </button>
        </div>

        {showLayoutForm && (
          <form onSubmit={handleCreateLayout} className="bg-white rounded-xl border border-gray-200 p-5 mb-5 space-y-3">
            <h3 className="font-medium text-gray-900">New layout option</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                required
                placeholder="e.g. Option A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input
                type="text"
                value={layoutDesc}
                onChange={(e) => setLayoutDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowLayoutForm(false)} className="text-sm text-gray-500 px-3">
                Cancel
              </button>
            </div>
          </form>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && activeLayoutId) handleImageUpload(activeLayoutId, file)
            e.target.value = ''
          }}
        />

        <div className="space-y-5">
          {room.layouts.map((layout) => (
            <div key={layout.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{layout.name}</h3>
                  {layout.description && <p className="text-sm text-gray-500">{layout.description}</p>}
                </div>
                <button
                  onClick={() => handleDeleteLayout(layout.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {layout.image_urls.map((url) => (
                  <div key={url} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                    <button
                      onClick={() => handleRemoveImage(layout, url)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition text-xs flex items-center justify-center"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveLayoutId(layout.id)
                  fileInputRef.current?.click()
                }}
                disabled={uploadingFor === layout.id}
                className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                {uploadingFor === layout.id ? 'Uploading...' : '+ Upload image'}
              </button>
            </div>
          ))}

          {room.layouts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No layout options yet. Add one above.</p>
          )}
        </div>
      </div>
    </main>
  )
}
