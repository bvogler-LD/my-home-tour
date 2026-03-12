import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { room_id, name, description, image_urls, display_order } = await req.json()

  if (!room_id || !name?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('layouts')
    .insert({
      room_id,
      name: name.trim(),
      description: description?.trim() || null,
      image_urls: image_urls || [],
      display_order: display_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create layout' }, { status: 500 })
  }

  return NextResponse.json(data)
}
