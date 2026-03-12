import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('rooms')
    .select('*, layouts(*)')
    .order('display_order')
    .order('display_order', { referencedTable: 'layouts' })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, display_order } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('rooms')
    .insert({ name: name.trim(), description: description?.trim() || null, display_order: display_order ?? 0 })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }

  return NextResponse.json(data)
}
