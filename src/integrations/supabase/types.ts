export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_payments: {
        Row: {
          ad_id: string
          ad_type: string
          amount: number
          created_at: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          plan_name: string
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_id: string
          ad_type: string
          amount: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          plan_name: string
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_id?: string
          ad_type?: string
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          plan_name?: string
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ad_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
          visibility_priority: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
          visibility_priority?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          visibility_priority?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_quantity: number | null
          court_id: string
          created_at: string
          discount_percentage: number | null
          end_time: string
          id: string
          partner_amount: number | null
          payment_id: string | null
          payment_status: string | null
          platform_fee: number | null
          start_time: string
          status: string | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_quantity?: number | null
          court_id: string
          created_at?: string
          discount_percentage?: number | null
          end_time: string
          id?: string
          partner_amount?: number | null
          payment_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          start_time: string
          status?: string | null
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_quantity?: number | null
          court_id?: string
          created_at?: string
          discount_percentage?: number | null
          end_time?: string
          id?: string
          partner_amount?: number | null
          payment_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          start_time?: string
          status?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          challenged_id: string
          challenger_id: string
          created_at: string
          id: string
          message: string | null
          preferred_date: string
          preferred_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          challenge_type: string
          challenged_id: string
          challenger_id: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_date: string
          preferred_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          challenged_id?: string
          challenger_id?: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_date?: string
          preferred_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_bookings: {
        Row: {
          booking_date: string
          class_id: string
          created_at: string
          end_time: string
          id: string
          instructor_amount: number | null
          instructor_id: string
          is_trial: boolean | null
          notes: string | null
          payment_id: string | null
          payment_status: string
          platform_fee: number | null
          start_time: string
          status: string
          student_id: string
          total_price: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          class_id: string
          created_at?: string
          end_time: string
          id?: string
          instructor_amount?: number | null
          instructor_id: string
          is_trial?: boolean | null
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          platform_fee?: number | null
          start_time: string
          status?: string
          student_id: string
          total_price: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          class_id?: string
          created_at?: string
          end_time?: string
          id?: string
          instructor_amount?: number | null
          instructor_id?: string
          is_trial?: boolean | null
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          platform_fee?: number | null
          start_time?: string
          status?: string
          student_id?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_bookings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_info"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_type: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          instructor_id: string
          max_students: number | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          class_type: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id: string
          max_students?: number | null
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          class_type?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id?: string
          max_students?: number | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_info"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          player1_id: string
          player2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          player1_id: string
          player2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          player1_id?: string
          player2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      court_reviews: {
        Row: {
          comment: string | null
          court_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          court_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          court_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_reviews_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          ad_payment_id: string | null
          ad_plan: string | null
          address: string | null
          available: boolean | null
          created_at: string
          description: string | null
          featured_plan: string | null
          featured_until: string | null
          features: string[] | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          owner_id: string | null
          partner_id: string | null
          payment_status: string | null
          price_per_hour: number
          rating: number | null
          sport_type: string
          type: string
          updated_at: string
        }
        Insert: {
          ad_payment_id?: string | null
          ad_plan?: string | null
          address?: string | null
          available?: boolean | null
          created_at?: string
          description?: string | null
          featured_plan?: string | null
          featured_until?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          owner_id?: string | null
          partner_id?: string | null
          payment_status?: string | null
          price_per_hour: number
          rating?: number | null
          sport_type: string
          type: string
          updated_at?: string
        }
        Update: {
          ad_payment_id?: string | null
          ad_plan?: string | null
          address?: string | null
          available?: boolean | null
          created_at?: string
          description?: string | null
          featured_plan?: string | null
          featured_until?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          owner_id?: string | null
          partner_id?: string | null
          payment_status?: string | null
          price_per_hour?: number
          rating?: number | null
          sport_type?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_info"
            referencedColumns: ["user_id"]
          },
        ]
      }
      featured_listing_payments: {
        Row: {
          court_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          partner_id: string | null
          payment_id: string | null
          payment_status: string | null
          plan_type: string
          price: number
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          court_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          partner_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          plan_type: string
          price: number
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          court_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          partner_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          plan_type?: string
          price?: number
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_listing_payments_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listing_payments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_info"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      instructor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          instructor_id: string
          is_available: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          instructor_id: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          instructor_id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_availability_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_info"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_blocked_times: {
        Row: {
          blocked_date: string
          created_at: string | null
          end_time: string
          id: string
          instructor_id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          blocked_date: string
          created_at?: string | null
          end_time: string
          id?: string
          instructor_id: string
          reason?: string | null
          start_time: string
        }
        Update: {
          blocked_date?: string
          created_at?: string | null
          end_time?: string
          id?: string
          instructor_id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_blocked_times_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_info"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_info: {
        Row: {
          ad_payment_id: string | null
          ad_plan: string | null
          availability: Json | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          experience_years: number | null
          hourly_rate: number
          id: string
          location: string | null
          payment_status: string | null
          specialization: string[] | null
          trial_class_available: boolean | null
          trial_class_price: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          ad_payment_id?: string | null
          ad_plan?: string | null
          availability?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number
          id?: string
          location?: string | null
          payment_status?: string | null
          specialization?: string[] | null
          trial_class_available?: boolean | null
          trial_class_price?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          ad_payment_id?: string | null
          ad_plan?: string | null
          availability?: Json | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number
          id?: string
          location?: string | null
          payment_status?: string | null
          specialization?: string[] | null
          trial_class_available?: boolean | null
          trial_class_price?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      league_invitations: {
        Row: {
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          league_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          league_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          league_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_invitations_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_rankings: {
        Row: {
          draws: number
          id: string
          league_id: string
          losses: number
          matches_played: number
          points: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          draws?: number
          id?: string
          league_id: string
          losses?: number
          matches_played?: number
          points?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          draws?: number
          id?: string
          league_id?: string
          losses?: number
          matches_played?: number
          points?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_rankings_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_tournament_matches: {
        Row: {
          created_at: string
          id: string
          match_date: string | null
          player1_id: string
          player1_score: number | null
          player2_id: string
          player2_score: number | null
          status: string
          tournament_id: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_date?: string | null
          player1_id: string
          player1_score?: number | null
          player2_id: string
          player2_score?: number | null
          status?: string
          tournament_id: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string | null
          player1_id?: string
          player1_score?: number | null
          player2_id?: string
          player2_score?: number | null
          status?: string
          tournament_id?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "league_tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "league_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      league_tournament_participants: {
        Row: {
          created_at: string
          id: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "league_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      league_tournaments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          league_id: string
          name: string
          start_date: string
          status: string
          tournament_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          league_id: string
          name: string
          start_date: string
          status?: string
          tournament_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          league_id?: string
          name?: string
          start_date?: string
          status?: string
          tournament_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_tournaments_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          admin_id: string
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          name: string
          rules: string | null
          sport_type: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
          rules?: string | null
          sport_type: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
          rules?: string | null
          sport_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_comments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "tournament_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      match_history: {
        Row: {
          court_name: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          match_date: string
          notes: string | null
          opponent_id: string | null
          opponent_name: string
          player_id: string
          result: string
          score: string | null
          sport_type: string
          updated_at: string
        }
        Insert: {
          court_name?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          match_date: string
          notes?: string | null
          opponent_id?: string | null
          opponent_name: string
          player_id: string
          result: string
          score?: string | null
          sport_type: string
          updated_at?: string
        }
        Update: {
          court_name?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          match_date?: string
          notes?: string | null
          opponent_id?: string | null
          opponent_name?: string
          player_id?: string
          result?: string
          score?: string | null
          sport_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_history_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "match_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_info: {
        Row: {
          business_address: string | null
          business_name: string | null
          business_type: string | null
          cnpj: string | null
          commission_rate: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          payment_info: Json | null
          specialization: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          cnpj?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          payment_info?: Json | null
          specialization?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          cnpj?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          payment_info?: Json | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      partner_search: {
        Row: {
          ad_plan: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          payment_id: string | null
          payment_status: string | null
          preferred_date: string | null
          skill_level: string | null
          sport_type: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_plan?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          payment_id?: string | null
          payment_status?: string | null
          preferred_date?: string | null
          skill_level?: string | null
          sport_type: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_plan?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          payment_id?: string | null
          payment_status?: string | null
          preferred_date?: string | null
          skill_level?: string | null
          sport_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_search_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          tournament_id: string | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          tournament_id?: string | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          tournament_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          dominant_hand: string | null
          email: string | null
          favorite_courts: string[] | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          playing_time: string | null
          preferred_surface: string | null
          profile_visibility: string | null
          ranking_points: number | null
          ranking_position: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          show_email: boolean | null
          show_phone: boolean | null
          skill_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          dominant_hand?: string | null
          email?: string | null
          favorite_courts?: string[] | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          playing_time?: string | null
          preferred_surface?: string | null
          profile_visibility?: string | null
          ranking_points?: number | null
          ranking_position?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_email?: boolean | null
          show_phone?: boolean | null
          skill_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          dominant_hand?: string | null
          email?: string | null
          favorite_courts?: string[] | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          playing_time?: string | null
          preferred_surface?: string | null
          profile_visibility?: string | null
          ranking_points?: number | null
          ranking_position?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_email?: boolean | null
          show_phone?: boolean | null
          skill_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          active: boolean | null
          created_at: string
          goals: string | null
          id: string
          instructor_id: string
          notes: string | null
          skill_level: string | null
          student_user_id: string
          total_classes: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          goals?: string | null
          id?: string
          instructor_id: string
          notes?: string | null
          skill_level?: string | null
          student_user_id: string
          total_classes?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          goals?: string | null
          id?: string
          instructor_id?: string
          notes?: string | null
          skill_level?: string | null
          student_user_id?: string
          total_classes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructor_info"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_brackets: {
        Row: {
          created_at: string | null
          id: string
          match_number: number
          player1_id: string | null
          player1_score: string | null
          player2_id: string | null
          player2_score: string | null
          round: string
          scheduled_time: string | null
          status: string | null
          tournament_id: string
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_number: number
          player1_id?: string | null
          player1_score?: string | null
          player2_id?: string | null
          player2_score?: string | null
          round: string
          scheduled_time?: string | null
          status?: string | null
          tournament_id: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_number?: number
          player1_id?: string | null
          player1_score?: string | null
          player2_id?: string | null
          player2_score?: string | null
          round?: string
          scheduled_time?: string | null
          status?: string | null
          tournament_id?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_brackets_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_brackets_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_brackets_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_brackets_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          category: string | null
          id: string
          modality: string | null
          organizer_amount: number | null
          partner_user_id: string | null
          payment_status: string | null
          platform_fee: number | null
          registration_date: string
          seed_position: number | null
          tournament_id: string
          user_id: string
          validated: boolean | null
          validation_notes: string | null
        }
        Insert: {
          category?: string | null
          id?: string
          modality?: string | null
          organizer_amount?: number | null
          partner_user_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          registration_date?: string
          seed_position?: number | null
          tournament_id: string
          user_id: string
          validated?: boolean | null
          validation_notes?: string | null
        }
        Update: {
          category?: string | null
          id?: string
          modality?: string | null
          organizer_amount?: number | null
          partner_user_id?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          registration_date?: string
          seed_position?: number | null
          tournament_id?: string
          user_id?: string
          validated?: boolean | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_partner_user_id_fkey"
            columns: ["partner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_generated: boolean | null
          categories: string[] | null
          created_at: string
          description: string | null
          end_date: string
          entry_fee: number | null
          id: string
          location: string
          max_participants: number | null
          modalities: string[] | null
          name: string
          organizer_id: string | null
          points_distribution: Json | null
          prize_pool: number | null
          registration_closed: boolean | null
          registration_deadline: string
          registration_start_date: string | null
          regulation: string | null
          sport_type: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          bracket_generated?: boolean | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          location: string
          max_participants?: number | null
          modalities?: string[] | null
          name: string
          organizer_id?: string | null
          points_distribution?: Json | null
          prize_pool?: number | null
          registration_closed?: boolean | null
          registration_deadline: string
          registration_start_date?: string | null
          regulation?: string | null
          sport_type: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          bracket_generated?: boolean | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          location?: string
          max_participants?: number | null
          modalities?: string[] | null
          name?: string
          organizer_id?: string | null
          points_distribution?: Json | null
          prize_pool?: number | null
          registration_closed?: boolean | null
          registration_deadline?: string
          registration_start_date?: string | null
          regulation?: string | null
          sport_type?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_league_member: {
        Args: { _league_id: string; _user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: { activity_data_param?: Json; activity_type_param: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "player" | "partner" | "admin" | "instructor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["player", "partner", "admin", "instructor"],
    },
  },
} as const
