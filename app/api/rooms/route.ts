import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getVoterFromCookie } from '@/lib/auth'

export async function GET() {
  const voter = await getVoterFromCookie()
  if (!voter) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rooms, error } = await supabaseAdmin
    .from('rooms')
    .select('*, layouts(*)')
    .order('display_order')
    .order('display_order', { referencedTable: 'layouts' })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }

  return NextResponse.json(rooms)
}
