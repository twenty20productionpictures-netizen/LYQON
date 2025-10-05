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
      applications: {
        Row: {
          ai_match_score: number | null
          applied_at: string | null
          audio_url: string | null
          cover_letter: string | null
          id: string
          project_id: string
          role_id: string | null
          status: string | null
          talent_id: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          ai_match_score?: number | null
          applied_at?: string | null
          audio_url?: string | null
          cover_letter?: string | null
          id?: string
          project_id: string
          role_id?: string | null
          status?: string | null
          talent_id: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          ai_match_score?: number | null
          applied_at?: string | null
          audio_url?: string | null
          cover_letter?: string | null
          id?: string
          project_id?: string
          role_id?: string | null
          status?: string | null
          talent_id?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      audition_evaluations: {
        Row: {
          audition_id: string
          created_at: string
          detailed_analysis: Json | null
          emotions_detected: Json
          id: string
          improvements: string[] | null
          overall_match_score: number
          recommendation: string
          strengths: string[] | null
          technical_notes: string[] | null
        }
        Insert: {
          audition_id: string
          created_at?: string
          detailed_analysis?: Json | null
          emotions_detected?: Json
          id?: string
          improvements?: string[] | null
          overall_match_score: number
          recommendation: string
          strengths?: string[] | null
          technical_notes?: string[] | null
        }
        Update: {
          audition_id?: string
          created_at?: string
          detailed_analysis?: Json | null
          emotions_detected?: Json
          id?: string
          improvements?: string[] | null
          overall_match_score?: number
          recommendation?: string
          strengths?: string[] | null
          technical_notes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "audition_evaluations_audition_id_fkey"
            columns: ["audition_id"]
            isOneToOne: false
            referencedRelation: "auditions"
            referencedColumns: ["id"]
          },
        ]
      }
      auditions: {
        Row: {
          created_at: string
          emotional_keywords: string[] | null
          id: string
          project_id: string
          role_description: string
          role_id: string | null
          status: string
          talent_id: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          emotional_keywords?: string[] | null
          id?: string
          project_id: string
          role_description: string
          role_id?: string | null
          status?: string
          talent_id: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          emotional_keywords?: string[] | null
          id?: string
          project_id?: string
          role_description?: string
          role_id?: string | null
          status?: string
          talent_id?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_projects: {
        Row: {
          completed_at: string | null
          created_at: string | null
          director_id: string
          id: string
          production_company: string | null
          project_id: string
          project_title: string
          project_type: string
          selected_talent_id: string
          shortlist_data: Json
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          director_id: string
          id?: string
          production_company?: string | null
          project_id: string
          project_title: string
          project_type: string
          selected_talent_id: string
          shortlist_data?: Json
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          director_id?: string
          id?: string
          production_company?: string | null
          project_id?: string
          project_title?: string
          project_type?: string
          selected_talent_id?: string
          shortlist_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "completed_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          muted: boolean | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          muted?: boolean | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          muted?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived: boolean | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      director_profiles: {
        Row: {
          ai_bias_filters: Json | null
          ai_matching_sensitivity: string | null
          ai_prioritization: Json | null
          company_name: string | null
          created_at: string | null
          id: string
          industry_role: string | null
          logo_url: string | null
          professional_bio: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          ai_bias_filters?: Json | null
          ai_matching_sensitivity?: string | null
          ai_prioritization?: Json | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          industry_role?: string | null
          logo_url?: string | null
          professional_bio?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          ai_bias_filters?: Json | null
          ai_matching_sensitivity?: string | null
          ai_prioritization?: Json | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          industry_role?: string | null
          logo_url?: string | null
          professional_bio?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "director_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "director_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      director_team_members: {
        Row: {
          created_at: string | null
          director_profile_id: string
          id: string
          invited_at: string | null
          joined_at: string | null
          member_email: string
          member_name: string
          permissions: Json | null
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          director_profile_id: string
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          member_email: string
          member_name: string
          permissions?: Json | null
          role: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          director_profile_id?: string
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          member_email?: string
          member_name?: string
          permissions?: Json | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "director_team_members_director_profile_id_fkey"
            columns: ["director_profile_id"]
            isOneToOne: false
            referencedRelation: "director_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          category: string
          created_at: string
          id: string
          is_moderated: boolean | null
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_moderated?: boolean | null
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_moderated?: boolean | null
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
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
          content: string
          created_at: string | null
          id: string
          link: string | null
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      project_roles: {
        Row: {
          created_at: string | null
          emotions: string[] | null
          id: string
          is_featured: boolean | null
          project_id: string
          requirements: Json | null
          role_description: string | null
          role_name: string
        }
        Insert: {
          created_at?: string | null
          emotions?: string[] | null
          id?: string
          is_featured?: boolean | null
          project_id: string
          requirements?: Json | null
          role_description?: string | null
          role_name: string
        }
        Update: {
          created_at?: string | null
          emotions?: string[] | null
          id?: string
          is_featured?: boolean | null
          project_id?: string
          requirements?: Json | null
          role_description?: string | null
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          deadline: string | null
          description: string | null
          director_id: string
          id: string
          is_draft: boolean | null
          location: string | null
          mood_board_urls: Json | null
          production_company: string | null
          project_type: string
          remote_auditions_only: boolean | null
          selected_talent_id: string | null
          shoot_end_date: string | null
          shoot_start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          director_id: string
          id?: string
          is_draft?: boolean | null
          location?: string | null
          mood_board_urls?: Json | null
          production_company?: string | null
          project_type: string
          remote_auditions_only?: boolean | null
          selected_talent_id?: string | null
          shoot_end_date?: string | null
          shoot_start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          director_id?: string
          id?: string
          is_draft?: boolean | null
          location?: string | null
          mood_board_urls?: Json | null
          production_company?: string | null
          project_type?: string
          remote_auditions_only?: boolean | null
          selected_talent_id?: string | null
          shoot_end_date?: string | null
          shoot_start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      talent_credits: {
        Row: {
          created_at: string | null
          director_name: string | null
          id: string
          is_featured: boolean | null
          production_company: string | null
          project_title: string
          project_type: string | null
          role_name: string
          talent_profile_id: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          director_name?: string | null
          id?: string
          is_featured?: boolean | null
          production_company?: string | null
          project_title: string
          project_type?: string | null
          role_name: string
          talent_profile_id: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          director_name?: string | null
          id?: string
          is_featured?: boolean | null
          production_company?: string | null
          project_title?: string
          project_type?: string | null
          role_name?: string
          talent_profile_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_credits_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_media: {
        Row: {
          ai_analysis_data: Json | null
          created_at: string | null
          duration: number | null
          file_size: number | null
          id: string
          is_featured: boolean | null
          media_category: string | null
          media_type: string
          talent_profile_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          ai_analysis_data?: Json | null
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          media_category?: string | null
          media_type: string
          talent_profile_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          ai_analysis_data?: Json | null
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          media_category?: string | null
          media_type?: string
          talent_profile_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_media_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_portfolio_projects: {
        Row: {
          ai_evaluation: Json | null
          created_at: string | null
          director_name: string | null
          id: string
          match_score: number | null
          production_company: string | null
          project_id: string
          project_title: string
          project_type: string
          role_description: string | null
          selected_at: string | null
          talent_id: string
        }
        Insert: {
          ai_evaluation?: Json | null
          created_at?: string | null
          director_name?: string | null
          id?: string
          match_score?: number | null
          production_company?: string | null
          project_id: string
          project_title: string
          project_type: string
          role_description?: string | null
          selected_at?: string | null
          talent_id: string
        }
        Update: {
          ai_evaluation?: Json | null
          created_at?: string | null
          director_name?: string | null
          id?: string
          match_score?: number | null
          production_company?: string | null
          project_id?: string
          project_title?: string
          project_type?: string
          role_description?: string | null
          selected_at?: string | null
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_portfolio_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          agent_contact: string | null
          agent_name: string | null
          ai_match_score: number | null
          athletic_skills: string[] | null
          combat_skills: string[] | null
          created_at: string | null
          ethnicity: string[] | null
          eye_color: string | null
          gender_identity: string | null
          hair_color: string | null
          height_cm: number | null
          height_feet: number | null
          height_inches: number | null
          id: string
          instruments: string[] | null
          languages: string[] | null
          location: string | null
          looks_types: string[] | null
          manager_contact: string | null
          manager_name: string | null
          profile_completion_percentage: number | null
          resume_url: string | null
          special_skills: string[] | null
          union_status: string | null
          updated_at: string | null
          user_id: string
          weight: number | null
          weight_kg: number | null
        }
        Insert: {
          agent_contact?: string | null
          agent_name?: string | null
          ai_match_score?: number | null
          athletic_skills?: string[] | null
          combat_skills?: string[] | null
          created_at?: string | null
          ethnicity?: string[] | null
          eye_color?: string | null
          gender_identity?: string | null
          hair_color?: string | null
          height_cm?: number | null
          height_feet?: number | null
          height_inches?: number | null
          id?: string
          instruments?: string[] | null
          languages?: string[] | null
          location?: string | null
          looks_types?: string[] | null
          manager_contact?: string | null
          manager_name?: string | null
          profile_completion_percentage?: number | null
          resume_url?: string | null
          special_skills?: string[] | null
          union_status?: string | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
          weight_kg?: number | null
        }
        Update: {
          agent_contact?: string | null
          agent_name?: string | null
          ai_match_score?: number | null
          athletic_skills?: string[] | null
          combat_skills?: string[] | null
          created_at?: string | null
          ethnicity?: string[] | null
          eye_color?: string | null
          gender_identity?: string | null
          hair_color?: string | null
          height_cm?: number | null
          height_feet?: number | null
          height_inches?: number | null
          id?: string
          instruments?: string[] | null
          languages?: string[] | null
          location?: string | null
          looks_types?: string[] | null
          manager_contact?: string | null
          manager_name?: string | null
          profile_completion_percentage?: number | null
          resume_url?: string | null
          special_skills?: string[] | null
          union_status?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      user_conversations: {
        Args: { _user_id: string }
        Returns: {
          conversation_id: string
        }[]
      }
    }
    Enums: {
      app_role: "talent" | "director" | "admin"
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
      app_role: ["talent", "director", "admin"],
    },
  },
} as const
