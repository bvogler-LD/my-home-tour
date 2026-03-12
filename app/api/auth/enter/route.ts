import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const { inviteCode, name } = await req.json()

  if (!inviteCode || !name?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (inviteCode !== process.env.INVITE_CODE) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 401 })
  }

  const sessionToken = uuidv4()

  const { data, error } = await supabaseAdmin
    .from('voters')
    .insert({ name: name.trim(), session_token: sessionToken })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create voter' }, { status: 500 })
  }

  const response = NextResponse.json({ success: true, voter: { id: data.id, name: data.name } })
  response.cookies.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return response
}
