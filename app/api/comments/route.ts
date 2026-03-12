import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getVoterFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const voter = await getVoterFromCookie()
  if (!voter) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { roomId, layoutId, text } = await req.json()

  if (!roomId || !text?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({
      voter_id: voter.id,
      room_id: roomId,
      layout_id: layoutId || null,
      text: text.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }

  return NextResponse.json({ success: true, comment: data })
}

export async function GET(req: NextRequest) {
  const voter = await getVoterFromCookie()
  if (!voter) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, voters(name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }

  return NextResponse.json(data)
}
