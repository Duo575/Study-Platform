import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Tables = Database['public']['Tables']
type Functions = Database['public']['Functions']

// User Profile Operations
export const userProfileService = {
  async create(profile: Tables['user_profiles']['Insert']) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['user_profiles']['Update']) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Game Stats Operations
export const gameStatsService = {
  async create(stats: Tables['game_stats']['Insert']) {
    const { data, error } = await supabase
      .from('game_stats')
      .insert(stats)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async awardXP(userId: string, xpAmount: number, source: string = 'unknown') {
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_xp_amount: xpAmount,
      p_source: source
    })
    
    if (error) throw error
    return data[0] // Function returns array, we want first result
  },

  async updateStreak(userId: string) {
    const { data, error } = await supabase.rpc('update_streak', {
      p_user_id: userId
    })
    
    if (error) throw error
    return data[0]
  }
}

// Pet Species Operations
export const petSpeciesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('pet_species')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('pet_species')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Study Pet Operations
export const studyPetService = {
  async create(pet: Tables['study_pets']['Insert']) {
    const { data, error } = await supabase
      .from('study_pets')
      .insert(pet)
      .select(`
        *,
        pet_species:species_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('study_pets')
      .select(`
        *,
        pet_species:species_id (*)
      `)
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async update(userId: string, updates: Tables['study_pets']['Update']) {
    const { data, error } = await supabase
      .from('study_pets')
      .update(updates)
      .eq('user_id', userId)
      .select(`
        *,
        pet_species:species_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  }
}

// Course Operations
export const courseService = {
  async create(course: Tables['courses']['Insert']) {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_progress (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_progress (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['courses']['Update']) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Quest Operations
export const questService = {
  async create(quest: Tables['quests']['Insert']) {
    const { data, error } = await supabase
      .from('quests')
      .insert(quest)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByUserId(userId: string, status?: Tables['quests']['Row']['status']) {
    let query = supabase
      .from('quests')
      .select(`
        *,
        courses (name, color)
      `)
      .eq('user_id', userId)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['quests']['Update']) {
    const { data, error } = await supabase
      .from('quests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async complete(id: string) {
    const { data, error } = await supabase
      .from('quests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Achievement Operations
export const achievementService = {
  async getDefinitions() {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement_definitions (*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async checkAndAward(userId: string) {
    const { data, error } = await supabase.rpc('check_and_award_achievements', {
      p_user_id: userId
    })
    
    if (error) throw error
    return data
  }
}

// Study Session Operations
export const studySessionService = {
  async create(session: Tables['study_sessions']['Insert']) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByUserId(userId: string, limit?: number) {
    let query = supabase
      .from('study_sessions')
      .select(`
        *,
        courses (name, color),
        todo_items (title)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async getStats(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('study_sessions')
      .select('duration, started_at, courses(name)')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Database utility functions
export const dbUtils = {
  async calculateXPReward(
    activityType: string,
    difficulty: string = 'medium',
    durationMinutes: number = 30,
    bonusMultiplier: number = 1.0
  ) {
    const { data, error } = await supabase.rpc('calculate_xp_reward', {
      activity_type: activityType,
      difficulty,
      duration_minutes: durationMinutes,
      bonus_multiplier: bonusMultiplier
    })
    
    if (error) throw error
    return data
  },

  async calculateLevelFromXP(totalXP: number) {
    const { data, error } = await supabase.rpc('calculate_level_from_xp', {
      total_xp: totalXP
    })
    
    if (error) throw error
    return data
  },

  async calculateXPForLevel(level: number) {
    const { data, error } = await supabase.rpc('calculate_xp_for_level', {
      target_level: level
    })
    
    if (error) throw error
    return data
  }
}