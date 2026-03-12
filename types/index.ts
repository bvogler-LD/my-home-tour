export interface Room {
  id: string
  name: string
  description: string | null
  display_order: number
  created_at: string
}

export interface Layout {
  id: string
  room_id: string
  name: string
  description: string | null
  image_urls: string[]
  display_order: number
  created_at: string
}

export interface Voter {
  id: string
  name: string
  session_token: string
  created_at: string
}

export interface Vote {
  id: string
  voter_id: string
  layout_id: string
  room_id: string
  created_at: string
}

export interface Comment {
  id: string
  voter_id: string
  room_id: string
  layout_id: string | null
  text: string
  created_at: string
}

export interface RoomWithLayouts extends Room {
  layouts: Layout[]
}

export interface VoteResult {
  voter_name: string
  room_name: string
  layout_name: string
  voted_at: string
}

export interface CommentResult {
  voter_name: string
  room_name: string
  layout_name: string | null
  text: string
  created_at: string
}
