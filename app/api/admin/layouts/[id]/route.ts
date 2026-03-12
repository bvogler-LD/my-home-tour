import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { name, description, image_urls, display_order } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('layouts')
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      image_urls,
      display_order,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabaseAdmin.from('layouts').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete layout' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
