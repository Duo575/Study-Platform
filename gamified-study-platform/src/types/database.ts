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
      user_profiles: {
        Row: {
          id: string
          username: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          timezone: string
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      game_stats: {
        Row: {
          user_id: string
          level: number
          total_xp: number
          current_xp: number
          streak_days: number
          last_activity: string
          weekly_stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          level?: number
          total_xp?: number
          current_xp?: number
          streak_days?: number
          last_activity?: string
          weekly_stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          level?: number
          total_xp?: number
          current_xp?: number
          streak_days?: number
          last_activity?: string
          weekly_stats?: Json
          created_at?: string
          updated_at?: string
        }
      }
      pet_species: {
        Row: {
          id: string
          name: string
          description: string | null
          base_happiness: number
          base_health: number
          evolution_stages: Json
          sprite_urls: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_happiness?: number
          base_health?: number
          evolution_stages?: Json
          sprite_urls?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_happiness?: number
          base_health?: number
          evolution_stages?: Json
          sprite_urls?: Json
          created_at?: string
        }
      }
      study_pets: {
        Row: {
          user_id: string
          name: string
          species_id: string
          level: number
          happiness: number
          health: number
          evolution_stage: string
          accessories: Json
          last_fed: string
          last_played: string
          last_interaction: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          species_id: string
          level?: number
          happiness?: number
          health?: number
          evolution_stage?: string
          accessories?: Json
          last_fed?: string
          last_played?: string
          last_interaction?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          species_id?: string
          level?: number
          happiness?: number
          health?: number
          evolution_stage?: string
          accessories?: Json
          last_fed?: string
          last_played?: string
          last_interaction?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          syllabus: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          syllabus?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          syllabus?: Json
          created_at?: string
          updated_at?: string
        }
      }
      course_progress: {
        Row: {
          course_id: string
          completion_percentage: number
          total_time_spent: number
          last_studied: string | null
          topics_completed: Json
          performance_score: number
          updated_at: string
        }
        Insert: {
          course_id: string
          completion_percentage?: number
          total_time_spent?: number
          last_studied?: string | null
          topics_completed?: Json
          performance_score?: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          completion_percentage?: number
          total_time_spent?: number
          last_studied?: string | null
          topics_completed?: Json
          performance_score?: number
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          description: string | null
          type: 'daily' | 'weekly' | 'milestone' | 'bonus'
          difficulty: 'easy' | 'medium' | 'hard'
          xp_reward: number
          requirements: Json
          status: 'available' | 'active' | 'completed' | 'expired'
          expires_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          title: string
          description?: string | null
          type: 'daily' | 'weekly' | 'milestone' | 'bonus'
          difficulty?: 'easy' | 'medium' | 'hard'
          xp_reward?: number
          requirements?: Json
          status?: 'available' | 'active' | 'completed' | 'expired'
          expires_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          title?: string
          description?: string | null
          type?: 'daily' | 'weekly' | 'milestone' | 'bonus'
          difficulty?: 'easy' | 'medium' | 'hard'
          xp_reward?: number
          requirements?: Json
          status?: 'available' | 'active' | 'completed' | 'expired'
          expires_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todo_items: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          quest_id: string | null
          title: string
          description: string | null
          priority: number
          estimated_time: number | null
          completed: boolean
          completed_at: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          quest_id?: string | null
          title: string
          description?: string | null
          priority?: number
          estimated_time?: number | null
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          quest_id?: string | null
          title?: string
          description?: string | null
          priority?: number
          estimated_time?: number | null
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          todo_id: string | null
          duration: number
          session_type: string
          focus_score: number | null
          notes: string | null
          started_at: string
          ended_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          todo_id?: string | null
          duration: number
          session_type?: string
          focus_score?: number | null
          notes?: string | null
          started_at: string
          ended_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          todo_id?: string | null
          duration?: number
          session_type?: string
          focus_score?: number | null
          notes?: string | null
          started_at?: string
          ended_at?: string
          created_at?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          todo_item_id: string | null
          quest_id: string | null
          start_time: string
          end_time: string | null
          duration: number
          type: 'work' | 'short_break' | 'long_break'
          completed: boolean
          interrupted: boolean
          xp_earned: number
          notes: string | null
          session_number: number
          cycle_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          todo_item_id?: string | null
          quest_id?: string | null
          start_time?: string
          end_time?: string | null
          duration: number
          type: 'work' | 'short_break' | 'long_break'
          completed?: boolean
          interrupted?: boolean
          xp_earned?: number
          notes?: string | null
          session_number?: number
          cycle_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          todo_item_id?: string | null
          quest_id?: string | null
          start_time?: string
          end_time?: string | null
          duration?: number
          type?: 'work' | 'short_break' | 'long_break'
          completed?: boolean
          interrupted?: boolean
          xp_earned?: number
          notes?: string | null
          session_number?: number
          cycle_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      achievement_definitions: {
        Row: {
          id: string
          name: string
          description: string
          category: 'study_milestone' | 'consistency' | 'subject_mastery' | 'social' | 'pet_care' | 'special_event'
          icon_url: string | null
          xp_reward: number
          unlock_conditions: Json
          rarity: string
          is_hidden: boolean
          is_seasonal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'study_milestone' | 'consistency' | 'subject_mastery' | 'social' | 'pet_care' | 'special_event'
          icon_url?: string | null
          xp_reward?: number
          unlock_conditions?: Json
          rarity?: string
          is_hidden?: boolean
          is_seasonal?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'study_milestone' | 'consistency' | 'subject_mastery' | 'social' | 'pet_care' | 'special_event'
          icon_url?: string | null
          xp_reward?: number
          unlock_conditions?: Json
          rarity?: string
          is_hidden?: boolean
          is_seasonal?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: Json
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress?: Json
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress?: Json
        }
      }
      study_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          invite_code: string
          max_members: number
          is_private: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          invite_code: string
          max_members?: number
          is_private?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          invite_code?: string
          max_members?: number
          is_private?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_memberships: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_xp_for_level: {
        Args: {
          target_level: number
        }
        Returns: number
      }
      calculate_level_from_xp: {
        Args: {
          total_xp: number
        }
        Returns: number
      }
      calculate_current_level_xp: {
        Args: {
          total_xp: number
        }
        Returns: number
      }
      calculate_xp_to_next_level: {
        Args: {
          total_xp: number
        }
        Returns: number
      }
      award_xp: {
        Args: {
          p_user_id: string
          p_xp_amount: number
          p_source?: string
        }
        Returns: {
          old_level: number
          new_level: number
          total_xp: number
          level_up: boolean
        }[]
      }
      calculate_xp_reward: {
        Args: {
          activity_type: string
          difficulty?: string
          duration_minutes?: number
          bonus_multiplier?: number
        }
        Returns: number
      }
      update_streak: {
        Args: {
          p_user_id: string
        }
        Returns: {
          streak_days: number
          bonus_awarded: boolean
          bonus_xp: number
        }[]
      }
      check_and_award_achievements: {
        Args: {
          p_user_id: string
        }
        Returns: {
          achievement_id: string
          achievement_name: string
          xp_awarded: number
        }[]
      }
    }
    Enums: {
      quest_type: 'daily' | 'weekly' | 'milestone' | 'bonus'
      quest_difficulty: 'easy' | 'medium' | 'hard'
      quest_status: 'available' | 'active' | 'completed' | 'expired'
      achievement_category: 'study_milestone' | 'consistency' | 'subject_mastery' | 'social' | 'pet_care' | 'special_event'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}