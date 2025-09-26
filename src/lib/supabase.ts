import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
          location: string | null
          bio: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
          location?: string | null
          bio?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
          location?: string | null
          bio?: string | null
        }
      }
      courts: {
        Row: {
          id: string
          created_at: string
          name: string
          type: string
          sport_type: 'tennis' | 'padel' | 'beach-tennis'
          image_url: string
          location: string
          address: string
          latitude: number
          longitude: number
          rating: number
          price_per_hour: number
          available: boolean
          features: string[]
          description: string | null
          owner_id: string
        }
        Insert: {
          name: string
          type: string
          sport_type: 'tennis' | 'padel' | 'beach-tennis'
          image_url: string
          location: string
          address: string
          latitude: number
          longitude: number
          price_per_hour: number
          features?: string[]
          description?: string | null
          owner_id: string
        }
        Update: {
          name?: string
          type?: string
          sport_type?: 'tennis' | 'padel' | 'beach-tennis'
          image_url?: string
          location?: string
          address?: string
          latitude?: number
          longitude?: number
          rating?: number
          price_per_hour?: number
          available?: boolean
          features?: string[]
          description?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          court_id: string
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'failed'
          payment_id: string | null
        }
        Insert: {
          court_id: string
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_id?: string | null
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_id?: string | null
        }
      }
      tournaments: {
        Row: {
          id: string
          created_at: string
          name: string
          image_url: string
          location: string
          start_date: string
          end_date: string
          registration_fee: number
          max_participants: number
          current_participants: number
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          prize: string
          organizer: string
          description: string | null
          sport_type: 'tennis' | 'padel' | 'beach-tennis'
        }
        Insert: {
          name: string
          image_url: string
          location: string
          start_date: string
          end_date: string
          registration_fee: number
          max_participants: number
          prize: string
          organizer: string
          description?: string | null
          sport_type: 'tennis' | 'padel' | 'beach-tennis'
        }
        Update: {
          name?: string
          image_url?: string
          location?: string
          start_date?: string
          end_date?: string
          registration_fee?: number
          max_participants?: number
          current_participants?: number
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          prize?: string
          organizer?: string
          description?: string | null
          sport_type?: 'tennis' | 'padel' | 'beach-tennis'
        }
      }
      tournament_registrations: {
        Row: {
          id: string
          created_at: string
          tournament_id: string
          user_id: string
          registration_date: string
          payment_status: 'pending' | 'paid' | 'failed'
          payment_id: string | null
        }
        Insert: {
          tournament_id: string
          user_id: string
          registration_date: string
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_id?: string | null
        }
        Update: {
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_id?: string | null
        }
      }
    }
  }
}