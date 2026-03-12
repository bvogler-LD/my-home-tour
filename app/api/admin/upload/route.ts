import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUploadUrl, getPublicUrl } from '@/lib/s3'
import { requireAdmin } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename, contentType } = await req.json()

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const ext = filename.split('.').pop()
  const key = `layouts/${uuidv4()}.${ext}`

  const presignedUrl = await generatePresignedUploadUrl(key, contentType)
  const publicUrl = getPublicUrl(key)

  return NextResponse.json({ presignedUrl, publicUrl, key })
}
