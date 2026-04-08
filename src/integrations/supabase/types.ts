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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      challenge_entries: {
        Row: {
          challenge_id: string
          created_at: string
          dream_id: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          dream_id: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          dream_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "dream_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_challenges: {
        Row: {
          badge_icon: string
          badge_name: string
          category: string | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          theme: string
          title: string
        }
        Insert: {
          badge_icon?: string
          badge_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          theme: string
          title: string
        }
        Update: {
          badge_icon?: string
          badge_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          theme?: string
          title?: string
        }
        Relationships: []
      }
      dream_comments: {
        Row: {
          content: string
          created_at: string
          dream_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dream_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dream_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_comments_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_likes: {
        Row: {
          created_at: string
          dream_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_likes_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_reactions: {
        Row: {
          created_at: string
          dream_id: string
          id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_id: string
          id?: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_id?: string
          id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_reactions_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dreams: {
        Row: {
          category: Database["public"]["Enums"]["dream_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_favorite: boolean
          is_public: boolean
          priority: Database["public"]["Enums"]["dream_priority"]
          share_token: string | null
          status: Database["public"]["Enums"]["dream_status"]
          story: string | null
          tags: string[] | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["dream_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean
          is_public?: boolean
          priority?: Database["public"]["Enums"]["dream_priority"]
          share_token?: string | null
          status?: Database["public"]["Enums"]["dream_status"]
          story?: string | null
          tags?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["dream_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean
          is_public?: boolean
          priority?: Database["public"]["Enums"]["dream_priority"]
          share_token?: string | null
          status?: Database["public"]["Enums"]["dream_status"]
          story?: string | null
          tags?: string[] | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          dream_id: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          dream_id: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          dream_id?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dream_id: string | null
          id: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_id?: string | null
          id?: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          dream_id?: string | null
          id?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_public: boolean
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_token: { Args: never; Returns: string }
    }
    Enums: {
      dream_category:
        | "personal"
        | "career"
        | "health"
        | "financial"
        | "creative"
        | "spiritual"
        | "relationships"
        | "adventure"
      dream_priority: "low" | "medium" | "high"
      dream_status: "active" | "completed" | "archived" | "paused"
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
      dream_category: [
        "personal",
        "career",
        "health",
        "financial",
        "creative",
        "spiritual",
        "relationships",
        "adventure",
      ],
      dream_priority: ["low", "medium", "high"],
      dream_status: ["active", "completed", "archived", "paused"],
    },
  },
} as const
