import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [votesResult, commentsResult] = await Promise.all([
    supabaseAdmin
      .from('votes')
      .select('*, voters(name), layouts(name), rooms(name)')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('comments')
      .select('*, voters(name), rooms(name), layouts(name)')
      .order('created_at', { ascending: false }),
  ])

  if (votesResult.error || commentsResult.error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }

  return NextResponse.json({
    votes: votesResult.data,
    comments: commentsResult.data,
  })
}
