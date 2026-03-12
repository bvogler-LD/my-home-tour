import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'
import { Voter } from '@/types'

export async function getVoterFromCookie(): Promise<Voter | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (!token) return null

  const { data } = await supabaseAdmin
    .from('voters')
    .select('*')
    .eq('session_token', token)
    .single()

  return data
}

export async function requireVoter(): Promise<Voter> {
  const voter = await getVoterFromCookie()
  if (!voter) throw new Error('Unauthorized')
  return voter
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  return token === process.env.ADMIN_CODE
}

export async function requireAdmin(): Promise<void> {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) throw new Error('Unauthorized')
}
