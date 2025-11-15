export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          location: string
          capacity: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          location: string
          capacity: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string
          capacity?: number
          created_by?: string
          created_at?: string
        }
      }
      rsvps: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string
          status: 'attending' | 'maybe' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          email: string
          status: 'attending' | 'maybe' | 'declined'
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          email?: string
          status?: 'attending' | 'maybe' | 'declined'
          created_at?: string
        }
      }
    }
    Views: {
      event_capacity_view: {
        Row: {
          event_id: string
          capacity: number
          attending_count: number
          remaining: number
        }
      }
    }
  }
}
