import { supabase } from '../lib/supabase';
import type {
  Routine,
  ScheduleSlot,
  RoutineTemplate,
  RoutinePerformance,
  SlotCompletion,
  RoutineShare,
  RoutineSuggestion,
  ScheduleConflict,
  RoutineForm,
  ScheduleSlotForm,
  RoutineAnalytics,
  WeeklySchedule,
  ActivityBreakdown,
  WeeklyRoutineTrend
} from '../types';

export class RoutineService {
  // Routine CRUD operations
  static async createRoutine(routineData: RoutineForm): Promise<Routine> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        name: routineData.name,
        description: routineData.description,
        color: routineData.color,
        template_id: routineData.templateId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRoutineFromDB(data);
  }

  static async getRoutines(): Promise<Routine[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        schedule_slots(*),
        routine_performance(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapRoutineFromDB);
  }

  static async getRoutineById(id: string): Promise<Routine> {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        schedule_slots(*),
        routine_performance(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapRoutineFromDB(data);
  }

  static async updateRoutine(id: string, updates: Partial<RoutineForm>): Promise<Routine> {
    const { data, error } = await supabase
      .from('routines')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRoutineFromDB(data);
  }

  static async deleteRoutine(id: string): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleRoutineActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  }

  // Schedule slot operations
  static async createScheduleSlot(slotData: ScheduleSlotForm): Promise<ScheduleSlot> {
    // Check for conflicts first
    const conflicts = await this.detectConflicts(
      slotData.dayOfWeek,
      slotData.startTime,
      slotData.endTime,
      slotData.routineId
    );

    if (conflicts.length > 0) {
      throw new Error(`Schedule conflict detected with: ${conflicts[0].activityName}`);
    }

    const { data, error } = await supabase
      .from('schedule_slots')
      .insert({
        routine_id: slotData.routineId,
        day_of_week: slotData.dayOfWeek,
        start_time: slotData.startTime,
        end_time: slotData.endTime,
        activity_type: slotData.activityType,
        activity_name: slotData.activityName,
        course_id: slotData.courseId,
        priority: slotData.priority,
        is_flexible: slotData.isFlexible,
        notes: slotData.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapScheduleSlotFromDB(data);
  }

  static async updateScheduleSlot(id: string, updates: Partial<ScheduleSlotForm>): Promise<ScheduleSlot> {
    const { data, error } = await supabase
      .from('schedule_slots')
      .update({
        day_of_week: updates.dayOfWeek,
        start_time: updates.startTime,
        end_time: updates.endTime,
        activity_type: updates.activityType,
        activity_name: updates.activityName,
        course_id: updates.courseId,
        priority: updates.priority,
        is_flexible: updates.isFlexible,
        notes: updates.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapScheduleSlotFromDB(data);
  }

  static async deleteScheduleSlot(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedule_slots')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getWeeklySchedule(routineId: string): Promise<WeeklySchedule> {
    const { data, error } = await supabase
      .from('schedule_slots')
      .select('*')
      .eq('routine_id', routineId)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    const weeklySchedule: WeeklySchedule = {};
    for (let day = 0; day <= 6; day++) {
      weeklySchedule[day] = [];
    }

    data.forEach(slot => {
      const mappedSlot = this.mapScheduleSlotFromDB(slot);
      weeklySchedule[mappedSlot.dayOfWeek].push(mappedSlot);
    });

    return weeklySchedule;
  }

  // Conflict detection
  static async detectConflicts(
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    routineId: string,
    excludeSlotId?: string
  ): Promise<ScheduleConflict[]> {
    const { data, error } = await supabase
      .rpc('detect_schedule_conflicts', {
        p_routine_id: routineId,
        p_day_of_week: dayOfWeek,
        p_start_time: startTime,
        p_end_time: endTime,
        p_exclude_slot_id: excludeSlotId || null,
      });

    if (error) throw error;
    return data || [];
  }

  // Performance tracking
  static async recordSlotCompletion(
    slotId: string,
    date: string,
    completed: boolean,
    actualDuration?: number,
    qualityRating?: number,
    notes?: string
  ): Promise<SlotCompletion> {
    const completionData: any = {
      slot_id: slotId,
      date,
      completed,
      notes,
    };

    if (completed) {
      completionData.completed_at = new Date().toISOString();
      if (actualDuration) completionData.actual_duration = actualDuration;
      if (qualityRating) completionData.quality_rating = qualityRating;
    }

    const { data, error } = await supabase
      .from('slot_completions')
      .upsert(completionData)
      .select()
      .single();

    if (error) throw error;
    return this.mapSlotCompletionFromDB(data);
  }

  static async getRoutinePerformance(routineId: string, days: number = 30): Promise<RoutinePerformance[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('routine_performance')
      .select('*')
      .eq('routine_id', routineId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(this.mapRoutinePerformanceFromDB);
  }

  static async calculateDailyPerformance(routineId: string, date: string): Promise<void> {
    // Get all slots for the routine
    const { data: slots, error: slotsError } = await supabase
      .from('schedule_slots')
      .select('id')
      .eq('routine_id', routineId);

    if (slotsError) throw slotsError;

    // Get completions for the date
    const { data: completions, error: completionsError } = await supabase
      .from('slot_completions')
      .select('*')
      .in('slot_id', slots.map(s => s.id))
      .eq('date', date);

    if (completionsError) throw completionsError;

    const totalSlots = slots.length;
    const completedSlots = completions.filter(c => c.completed).length;
    const totalPlannedMinutes = await this.calculatePlannedMinutes(routineId);
    const actualMinutes = completions.reduce((sum, c) => sum + (c.actual_duration || 0), 0);

    // Upsert performance record
    const { error: performanceError } = await supabase
      .from('routine_performance')
      .upsert({
        routine_id: routineId,
        date,
        total_slots: totalSlots,
        completed_slots: completedSlots,
        total_planned_minutes: totalPlannedMinutes,
        actual_minutes: actualMinutes,
        efficiency_score: totalPlannedMinutes > 0 ? (actualMinutes / totalPlannedMinutes) * 100 : 0,
      });

    if (performanceError) throw performanceError;
  }

  // Templates
  static async getRoutineTemplates(): Promise<RoutineTemplate[]> {
    const { data, error } = await supabase
      .from('routine_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data.map(this.mapRoutineTemplateFromDB);
  }

  static async createRoutineFromTemplate(templateId: string, name: string): Promise<Routine> {
    const template = await this.getTemplateById(templateId);
    
    // Create routine
    const routine = await this.createRoutine({
      name,
      description: `Created from ${template.name} template`,
      color: '#3B82F6',
      templateId,
    });

    // Create schedule slots from template
    for (const slotTemplate of template.templateData) {
      await this.createScheduleSlot({
        routineId: routine.id,
        ...slotTemplate,
      });
    }

    // Increment template usage
    await supabase
      .from('routine_templates')
      .update({ usage_count: template.usageCount + 1 })
      .eq('id', templateId);

    return routine;
  }

  // Analytics
  static async getRoutineAnalytics(routineId: string): Promise<RoutineAnalytics> {
    const [performance, consistency] = await Promise.all([
      this.getRoutinePerformance(routineId, 30),
      this.calculateConsistencyScore(routineId),
    ]);

    const averageCompletionRate = performance.length > 0
      ? performance.reduce((sum, p) => sum + p.completionRate, 0) / performance.length
      : 0;

    const totalActiveTime = performance.reduce((sum, p) => sum + p.actualMinutes, 0);

    // Calculate weekly trends
    const weeklyTrends = this.calculateWeeklyTrends(performance);

    // Calculate activity breakdown
    const activityBreakdown = await this.calculateActivityBreakdown(routineId);

    return {
      consistencyScore: consistency,
      averageCompletionRate,
      totalActiveTime,
      mostProductiveDay: 0, // TODO: Calculate from data
      mostProductiveHour: 9, // TODO: Calculate from data
      streakDays: 0, // TODO: Calculate streak
      longestStreak: 0, // TODO: Calculate longest streak
      weeklyTrends,
      activityBreakdown,
    };
  }

  // Suggestions
  static async getRoutineSuggestions(): Promise<RoutineSuggestion[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routine_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_applied', false)
      .eq('is_dismissed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapRoutineSuggestionFromDB);
  }

  static async generateSuggestions(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.rpc('generate_routine_suggestions', {
      p_user_id: user.id,
    });

    if (error) throw error;
  }

  static async applySuggestion(suggestionId: string): Promise<void> {
    const { error } = await supabase
      .from('routine_suggestions')
      .update({
        is_applied: true,
        applied_at: new Date().toISOString(),
      })
      .eq('id', suggestionId);

    if (error) throw error;
  }

  static async dismissSuggestion(suggestionId: string): Promise<void> {
    const { error } = await supabase
      .from('routine_suggestions')
      .update({
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId);

    if (error) throw error;
  }

  // Helper methods
  private static async getTemplateById(id: string): Promise<RoutineTemplate> {
    const { data, error } = await supabase
      .from('routine_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapRoutineTemplateFromDB(data);
  }

  private static async calculateConsistencyScore(routineId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_routine_consistency', {
        p_routine_id: routineId,
        p_days_back: 30,
      });

    if (error) throw error;
    return data || 0;
  }

  private static async calculatePlannedMinutes(routineId: string): Promise<number> {
    const { data, error } = await supabase
      .from('schedule_slots')
      .select('start_time, end_time')
      .eq('routine_id', routineId);

    if (error) throw error;

    return data.reduce((total, slot) => {
      const start = new Date(`1970-01-01T${slot.start_time}`);
      const end = new Date(`1970-01-01T${slot.end_time}`);
      const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return total + minutes;
    }, 0);
  }

  private static calculateWeeklyTrends(performance: RoutinePerformance[]): WeeklyRoutineTrend[] {
    const weeklyData: { [key: string]: RoutinePerformance[] } = {};
    
    performance.forEach(p => {
      const date = new Date(p.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(p);
    });

    return Object.entries(weeklyData).map(([weekStart, weekData]) => ({
      weekStart,
      completionRate: weekData.reduce((sum, p) => sum + p.completionRate, 0) / weekData.length,
      totalMinutes: weekData.reduce((sum, p) => sum + p.actualMinutes, 0),
      efficiencyScore: weekData.reduce((sum, p) => sum + p.efficiencyScore, 0) / weekData.length,
    }));
  }

  private static async calculateActivityBreakdown(routineId: string): Promise<ActivityBreakdown[]> {
    const { data, error } = await supabase
      .from('schedule_slots')
      .select('activity_type')
      .eq('routine_id', routineId);

    if (error) throw error;

    const breakdown: { [key: string]: ActivityBreakdown } = {};
    const total = data.length;

    data.forEach(slot => {
      if (!breakdown[slot.activity_type]) {
        breakdown[slot.activity_type] = {
          activityType: slot.activity_type,
          totalMinutes: 0,
          completionRate: 0,
          averageQuality: 0,
          percentage: 0,
        };
      }
      breakdown[slot.activity_type].percentage = ((breakdown[slot.activity_type].percentage * total + 1) / total) * 100;
    });

    return Object.values(breakdown);
  }

  // Mapping functions
  private static mapRoutineFromDB(data: any): Routine {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      color: data.color,
      isActive: data.is_active,
      templateId: data.template_id,
      scheduleSlots: (data.schedule_slots || []).map(this.mapScheduleSlotFromDB),
      performance: (data.routine_performance || []).map(this.mapRoutinePerformanceFromDB),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapScheduleSlotFromDB(data: any): ScheduleSlot {
    return {
      id: data.id,
      routineId: data.routine_id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      activityType: data.activity_type,
      activityName: data.activity_name,
      courseId: data.course_id,
      priority: data.priority,
      isFlexible: data.is_flexible,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapRoutinePerformanceFromDB(data: any): RoutinePerformance {
    return {
      id: data.id,
      routineId: data.routine_id,
      date: data.date,
      totalSlots: data.total_slots,
      completedSlots: data.completed_slots,
      completionRate: parseFloat(data.completion_rate),
      totalPlannedMinutes: data.total_planned_minutes,
      actualMinutes: data.actual_minutes,
      efficiencyScore: parseFloat(data.efficiency_score),
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapSlotCompletionFromDB(data: any): SlotCompletion {
    return {
      id: data.id,
      slotId: data.slot_id,
      date: data.date,
      completed: data.completed,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      actualDuration: data.actual_duration,
      qualityRating: data.quality_rating,
      notes: data.notes,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapRoutineTemplateFromDB(data: any): RoutineTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      templateData: data.template_data,
      isPublic: data.is_public,
      createdBy: data.created_by,
      usageCount: data.usage_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapRoutineSuggestionFromDB(data: any): RoutineSuggestion {
    return {
      id: data.id,
      userId: data.user_id,
      routineId: data.routine_id,
      suggestionType: data.suggestion_type,
      title: data.title,
      description: data.description,
      suggestedChanges: data.suggested_changes,
      priority: data.priority,
      isApplied: data.is_applied,
      isDismissed: data.is_dismissed,
      createdAt: new Date(data.created_at),
      appliedAt: data.applied_at ? new Date(data.applied_at) : undefined,
      dismissedAt: data.dismissed_at ? new Date(data.dismissed_at) : undefined,
    };
  }
}