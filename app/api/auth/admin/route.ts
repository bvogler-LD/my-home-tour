import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { adminCode } = await req.json()

  if (!adminCode) {
    return NextResponse.json({ error: 'Missing admin code' }, { status: 400 })
  }

  if (adminCode !== process.env.ADMIN_CODE) {
    return NextResponse.json({ error: 'Invalid admin code' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', adminCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
