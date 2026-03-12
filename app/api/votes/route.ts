import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getVoterFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const voter = await getVoterFromCookie()
  if (!voter) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { layoutId, roomId } = await req.json()

  if (!layoutId || !roomId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Upsert — delete existing vote for this room then insert new one
  await supabaseAdmin
    .from('votes')
    .delete()
    .eq('voter_id', voter.id)
    .eq('room_id', roomId)

  const { data, error } = await supabaseAdmin
    .from('votes')
    .insert({ voter_id: voter.id, layout_id: layoutId, room_id: roomId })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 })
  }

  return NextResponse.json({ success: true, vote: data })
}

export async function GET() {
  const voter = await getVoterFromCookie()
  if (!voter) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('votes')
    .select('*, layouts(name, room_id, rooms(name))')
    .eq('voter_id', voter.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
  }

  return NextResponse.json(data)
}
