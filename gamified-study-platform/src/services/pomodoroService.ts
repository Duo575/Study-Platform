import { supabase } from '../lib/supabase';
import { 
  PomodoroSession, 
  PomodoroSettings, 
  PomodoroAnalytics,
  DailyPomodoroStats,
  WeeklyPomodoroStats,
  SubjectPomodoroStats,
  BreakActivity 
} from '../types';
import { format, startOfWeek, subDays, parseISO } from 'date-fns';

export class PomodoroService {
  // Create a new Pomodoro session
  static async createSession(
    userId: string,
    sessionData: Partial<PomodoroSession>
  ): Promise<PomodoroSession> {
    const session: Omit<PomodoroSession, 'id'> = {
      userId,
      startTime: new Date(),
      duration: sessionData.duration || 25,
      type: sessionData.type || 'work',
      completed: false,
      interrupted: false,
      xpEarned: 0,
      sessionNumber: sessionData.sessionNumber || 1,
      cycleId: sessionData.cycleId || crypto.randomUUID(),
      courseId: sessionData.courseId,
      todoItemId: sessionData.todoItemId,
      questId: sessionData.questId,
      notes: sessionData.notes,
    };

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Complete a Pomodoro session
  static async completeSession(
    sessionId: string,
    completed: boolean = true,
    notes?: string
  ): Promise<PomodoroSession> {
    const endTime = new Date();
    const xpEarned = completed ? this.calculateXP('work', 25) : 0;

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .update({
        endTime,
        completed,
        interrupted: !completed,
        xpEarned,
        notes,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user's Pomodoro sessions
  static async getUserSessions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PomodoroSession[]> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('userId', userId)
      .order('startTime', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // Calculate XP based on session type and duration
  static calculateXP(type: 'work' | 'short_break' | 'long_break', duration: number): number {
    const baseXP = {
      work: 10,
      short_break: 2,
      long_break: 5,
    };

    return Math.floor((baseXP[type] * duration) / 25); // Normalized to 25-minute sessions
  }

  // Get comprehensive analytics for a user
  static async getAnalytics(userId: string): Promise<PomodoroAnalytics> {
    const sessions = await this.getUserSessions(userId, 1000);
    const completedSessions = sessions.filter(s => s.completed);
    
    const totalSessions = sessions.length;
    const totalCompletedSessions = completedSessions.length;
    const totalFocusTime = completedSessions
      .filter(s => s.type === 'work')
      .reduce((sum, s) => sum + s.duration, 0);

    const completionRate = totalSessions > 0 ? (totalCompletedSessions / totalSessions) * 100 : 0;
    const averageSessionLength = totalCompletedSessions > 0 
      ? totalFocusTime / totalCompletedSessions 
      : 0;

    // Calculate daily stats for the last 30 days
    const dailyStats = this.calculateDailyStats(sessions);
    
    // Calculate weekly stats for the last 12 weeks
    const weeklyStats = this.calculateWeeklyStats(sessions);
    
    // Calculate peak hours
    const peakHours = this.calculatePeakHours(completedSessions);
    
    // Calculate subject breakdown
    const subjectBreakdown = await this.calculateSubjectBreakdown(userId, completedSessions);
    
    // Calculate streak
    const { streakDays, longestStreak } = this.calculateStreaks(sessions);

    return {
      totalSessions,
      completedSessions: totalCompletedSessions,
      totalFocusTime,
      averageSessionLength,
      completionRate,
      dailyStats,
      weeklyStats,
      peakHours,
      subjectBreakdown,
      streakDays,
      longestStreak,
    };
  }

  // Calculate daily statistics
  private static calculateDailyStats(sessions: PomodoroSession[]): DailyPomodoroStats[] {
    const dailyMap = new Map<string, DailyPomodoroStats>();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyMap.set(date, {
        date,
        sessionsCompleted: 0,
        focusTime: 0,
        completionRate: 0,
        xpEarned: 0,
      });
    }

    // Populate with actual data
    sessions.forEach(session => {
      const date = format(session.startTime, 'yyyy-MM-dd');
      const stats = dailyMap.get(date);
      
      if (stats) {
        if (session.completed) {
          stats.sessionsCompleted++;
          if (session.type === 'work') {
            stats.focusTime += session.duration;
          }
          stats.xpEarned += session.xpEarned;
        }
      }
    });

    // Calculate completion rates
    dailyMap.forEach(stats => {
      const dayTotal = sessions.filter(s => 
        format(s.startTime, 'yyyy-MM-dd') === stats.date
      ).length;
      stats.completionRate = dayTotal > 0 ? (stats.sessionsCompleted / dayTotal) * 100 : 0;
    });

    return Array.from(dailyMap.values());
  }

  // Calculate weekly statistics
  private static calculateWeeklyStats(sessions: PomodoroSession[]): WeeklyPomodoroStats[] {
    const weeklyMap = new Map<string, WeeklyPomodoroStats>();
    
    // Initialize last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = format(startOfWeek(subDays(new Date(), i * 7)), 'yyyy-MM-dd');
      weeklyMap.set(weekStart, {
        weekStart,
        sessionsCompleted: 0,
        focusTime: 0,
        averageCompletionRate: 0,
        xpEarned: 0,
      });
    }

    // Populate with actual data
    sessions.forEach(session => {
      const weekStart = format(startOfWeek(session.startTime), 'yyyy-MM-dd');
      const stats = weeklyMap.get(weekStart);
      
      if (stats && session.completed) {
        stats.sessionsCompleted++;
        if (session.type === 'work') {
          stats.focusTime += session.duration;
        }
        stats.xpEarned += session.xpEarned;
      }
    });

    return Array.from(weeklyMap.values());
  }

  // Calculate peak productivity hours
  private static calculatePeakHours(sessions: PomodoroSession[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    sessions.forEach(session => {
      if (session.type === 'work') {
        const hour = session.startTime.getHours();
        hourCounts[hour] += session.duration;
      }
    });

    // Return top 3 most productive hours
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  // Calculate subject breakdown
  private static async calculateSubjectBreakdown(
    userId: string, 
    sessions: PomodoroSession[]
  ): Promise<SubjectPomodoroStats[]> {
    // Get user's courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, name')
      .eq('userId', userId);

    if (!courses) return [];

    const subjectMap = new Map<string, SubjectPomodoroStats>();
    
    // Initialize with courses
    courses.forEach(course => {
      subjectMap.set(course.id, {
        courseId: course.id,
        courseName: course.name,
        sessionsCompleted: 0,
        focusTime: 0,
        completionRate: 0,
        averageSessionLength: 0,
      });
    });

    // Populate with session data
    sessions.forEach(session => {
      if (session.courseId && session.type === 'work') {
        const stats = subjectMap.get(session.courseId);
        if (stats) {
          stats.sessionsCompleted++;
          stats.focusTime += session.duration;
        }
      }
    });

    // Calculate averages
    subjectMap.forEach(stats => {
      if (stats.sessionsCompleted > 0) {
        stats.averageSessionLength = stats.focusTime / stats.sessionsCompleted;
        stats.completionRate = 100; // Simplified - could be more complex
      }
    });

    return Array.from(subjectMap.values()).filter(stats => stats.sessionsCompleted > 0);
  }

  // Calculate study streaks
  private static calculateStreaks(sessions: PomodoroSession[]): { streakDays: number; longestStreak: number } {
    const completedSessions = sessions.filter(s => s.completed && s.type === 'work');
    const dates = [...new Set(completedSessions.map(s => format(s.startTime, 'yyyy-MM-dd')))].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: Date | null = null;

    dates.forEach(dateStr => {
      const date = parseISO(dateStr);
      
      if (lastDate) {
        const daysDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = date;
    });

    longestStreak = Math.max(longestStreak, currentStreak);
    
    // Check if current streak is still active (last session was today or yesterday)
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const lastSessionDate = dates[dates.length - 1];
    
    const streakDays = (lastSessionDate === today || lastSessionDate === yesterday) 
      ? currentStreak 
      : 0;

    return { streakDays, longestStreak };
  }

  // Get default break activities
  static getBreakActivities(): BreakActivity[] {
    return [
      {
        id: '1',
        title: 'Stretch & Move',
        description: 'Do some light stretching or walk around',
        duration: 5,
        type: 'physical',
        xpBonus: 2,
        icon: '🤸‍♀️',
      },
      {
        id: '2',
        title: 'Deep Breathing',
        description: 'Practice mindful breathing exercises',
        duration: 3,
        type: 'mental',
        xpBonus: 1,
        icon: '🧘‍♂️',
      },
      {
        id: '3',
        title: 'Hydrate',
        description: 'Drink water and refresh yourself',
        duration: 2,
        type: 'physical',
        xpBonus: 1,
        icon: '💧',
      },
      {
        id: '4',
        title: 'Quick Sketch',
        description: 'Draw something simple to relax your mind',
        duration: 5,
        type: 'creative',
        xpBonus: 3,
        icon: '🎨',
      },
      {
        id: '5',
        title: 'Check Progress',
        description: 'Review your study achievements',
        duration: 3,
        type: 'mental',
        xpBonus: 2,
        icon: '📊',
      },
    ];
  }

  // Get default Pomodoro settings
  static getDefaultSettings(): PomodoroSettings {
    return {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      soundEnabled: true,
    };
  }
}