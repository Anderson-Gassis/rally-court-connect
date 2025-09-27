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
      bookings: {
        Row: {
          booking_date: string
          court_id: string
          created_at: string
          end_time: string
          id: string
          payment_id: string | null
          payment_status: string | null
          start_time: string
          status: string | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          court_id: string
          created_at?: string
          end_time: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          start_time: string
          status?: string | null
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          court_id?: string
          created_at?: string
          end_time?: string
          id?: string
          payment_id?: string | null
          payment_status?: string | null
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
      courts: {
        Row: {
          address: string | null
          available: boolean | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          owner_id: string | null
          partner_id: string | null
          price_per_hour: number
          rating: number | null
          sport_type: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          available?: boolean | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          owner_id?: string | null
          partner_id?: string | null
          price_per_hour: number
          rating?: number | null
          sport_type: string
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          available?: boolean | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          owner_id?: string | null
          partner_id?: string | null
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
          payment_info: Json | null
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
          payment_info?: Json | null
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
          payment_info?: Json | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["user_role"] | null
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
          role?: Database["public"]["Enums"]["user_role"] | null
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
          role?: Database["public"]["Enums"]["user_role"] | null
          skill_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_registrations: {
        Row: {
          id: string
          payment_status: string | null
          registration_date: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          payment_status?: string | null
          registration_date?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          payment_status?: string | null
          registration_date?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
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
          created_at: string
          description: string | null
          end_date: string
          entry_fee: number | null
          id: string
          location: string
          max_participants: number | null
          name: string
          organizer_id: string | null
          prize_pool: number | null
          registration_deadline: string
          sport_type: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          location: string
          max_participants?: number | null
          name: string
          organizer_id?: string | null
          prize_pool?: number | null
          registration_deadline: string
          sport_type: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          location?: string
          max_participants?: number | null
          name?: string
          organizer_id?: string | null
          prize_pool?: number | null
          registration_deadline?: string
          sport_type?: string
          start_date?: string
          status?: string | null
          updated_at?: string
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
    }
    Enums: {
      user_role: "player" | "partner" | "admin"
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
      user_role: ["player", "partner", "admin"],
    },
  },
} as const
