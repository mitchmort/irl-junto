export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_types: {
        Row: {
          created_at: string | null
          default_players: number
          icon: string
          id: string
          name: string
          sub_types: Json
        }
        Insert: {
          created_at?: string | null
          default_players?: number
          icon: string
          id?: string
          name: string
          sub_types?: Json
        }
        Update: {
          created_at?: string | null
          default_players?: number
          icon?: string
          id?: string
          name?: string
          sub_types?: Json
        }
        Relationships: []
      }
      event_participants: {
        Row: {
          created_at: string | null
          event_id: number
          id: number
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: number
          id?: never
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: number
          id?: never
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          arrival_instructions: string | null
          cost: number | null
          created_at: string | null
          date: string
          description: string | null
          duration: string | null
          equipment_requirements: string | null
          id: number
          image: string | null
          location: string
          max_participants: number
          notes: string | null
          organizer: string | null
          participant_count: number
          share_link: string | null
          skill_levels: Json | null
          sport: string
          status: string
          sub_type: string | null
          time: string
          title: string
        }
        Insert: {
          arrival_instructions?: string | null
          cost?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          duration?: string | null
          equipment_requirements?: string | null
          id?: never
          image?: string | null
          location: string
          max_participants: number
          notes?: string | null
          organizer?: string | null
          participant_count?: number
          share_link?: string | null
          skill_levels?: Json | null
          sport: string
          status: string
          sub_type?: string | null
          time: string
          title: string
        }
        Update: {
          arrival_instructions?: string | null
          cost?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          duration?: string | null
          equipment_requirements?: string | null
          id?: never
          image?: string | null
          location?: string
          max_participants?: number
          notes?: string | null
          organizer?: string | null
          participant_count?: number
          share_link?: string | null
          skill_levels?: Json | null
          sport?: string
          status?: string
          sub_type?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_fkey"
            columns: ["organizer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_kpis: {
        Row: {
          active_organizers: number | null
          no_show_rate: number | null
          rsvp_conversion_rate: number | null
          weekly_completed_games: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      join_event: {
        Args: { event_id_to_join: number }
        Returns: undefined
      }
      leave_event: {
        Args: { event_id_to_leave: number }
        Returns: undefined
      }
      mark_attendance: {
        Args: { p_event_id: number; p_user_id: string; p_status: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Additional type helpers for easier use
export type Event = Tables<"events">
export type EventInsert = TablesInsert<"events">
export type EventUpdate = TablesUpdate<"events">

export type Profile = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">
export type ProfileUpdate = TablesUpdate<"profiles">

export type ActivityType = Tables<"activity_types">
export type ActivityTypeInsert = TablesInsert<"activity_types">
export type ActivityTypeUpdate = TablesUpdate<"activity_types">

export type EventParticipant = Tables<"event_participants">
export type EventParticipantInsert = TablesInsert<"event_participants">
export type EventParticipantUpdate = TablesUpdate<"event_participants">

export type User = Tables<"users">
export type UserInsert = TablesInsert<"users">
export type UserUpdate = TablesUpdate<"users">

export type DashboardKPIs = Tables<"dashboard_kpis"> 