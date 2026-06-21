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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      movies: {
        Row: {
          backdrop_path: string | null
          genres: Json | null
          media_type: Database["public"]["Enums"]["media_type"]
          overview: string | null
          poster_path: string | null
          release_date: string | null
          runtime: number | null
          synced_at: string
          title: string
          tmdb_id: number
        }
        Insert: {
          backdrop_path?: string | null
          genres?: Json | null
          media_type: Database["public"]["Enums"]["media_type"]
          overview?: string | null
          poster_path?: string | null
          release_date?: string | null
          runtime?: number | null
          synced_at?: string
          title: string
          tmdb_id: number
        }
        Update: {
          backdrop_path?: string | null
          genres?: Json | null
          media_type?: Database["public"]["Enums"]["media_type"]
          overview?: string | null
          poster_path?: string | null
          release_date?: string | null
          runtime?: number | null
          synced_at?: string
          title?: string
          tmdb_id?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          comment: string | null
          created_at: string
          final_rank: number | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          reaction: Database["public"]["Enums"]["reaction_type"]
          rewatch: boolean
          tags: string[]
          tmdb_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          final_rank?: number | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          reaction: Database["public"]["Enums"]["reaction_type"]
          rewatch?: boolean
          tags?: string[]
          tmdb_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          final_rank?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          reaction?: Database["public"]["Enums"]["reaction_type"]
          rewatch?: boolean
          tags?: string[]
          tmdb_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_movie_fkey"
            columns: ["tmdb_id", "media_type"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["tmdb_id", "media_type"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_movie_rankings: {
        Row: {
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          position: number
          reaction: Database["public"]["Enums"]["reaction_type"]
          score: number
          tmdb_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          position: number
          reaction: Database["public"]["Enums"]["reaction_type"]
          score: number
          tmdb_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          position?: number
          reaction?: Database["public"]["Enums"]["reaction_type"]
          score?: number
          tmdb_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rankings_movie_fkey"
            columns: ["tmdb_id", "media_type"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["tmdb_id", "media_type"]
          },
        ]
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          tmdb_id: number
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          tmdb_id: number
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          tmdb_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_movie_fkey"
            columns: ["tmdb_id", "media_type"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["tmdb_id", "media_type"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_ranking: {
        Args: {
          p_bucket_position: number
          p_media_type: Database["public"]["Enums"]["media_type"]
          p_reaction: Database["public"]["Enums"]["reaction_type"]
          p_tmdb_id: number
        }
        Returns: {
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          position: number
          reaction: Database["public"]["Enums"]["reaction_type"]
          score: number
          tmdb_id: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_movie_rankings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      media_type: "movie" | "tv"
      reaction_type: "love" | "fine" | "dislike"
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
      media_type: ["movie", "tv"],
      reaction_type: ["love", "fine", "dislike"],
    },
  },
} as const
