import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import {
  sanitizeExportData,
  validateExportData,
  generateExportFilename,
  flattenForCSV,
  compressExportData,
} from '../utils/exportUtils';
import type {
  User,
  Course,
  Quest,
  TodoItem,
  StudySession,
  Achievement,
  StudyPet,
  PomodoroSession,
  Routine,
} from '../types';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includePersonalData?: boolean;
  includeProgressData?: boolean;
  includeGameData?: boolean;
  includeStudyData?: boolean;
}

export interface UserDataExport {
  exportDate: string;
  user: Partial<User>;
  courses: Course[];
  quests: Quest[];
  todos: TodoItem[];
  studySessions: StudySession[];
  pomodoroSessions: PomodoroSession[];
  achievements: Achievement[];
  pet: StudyPet | null;
  routines: Routine[];
  analytics: {
    totalStudyTime: number;
    totalSessions: number;
    averageSessionLength: number;
    streakDays: number;
    level: number;
    totalXP: number;
  };
}

class ExportService {
  async exportUserData(userId: string, options: ExportOptions): Promise<void> {
    try {
      let userData = await this.gatherUserData(userId, options);

      // Sanitize and validate data
      userData = sanitizeExportData(userData, options);
      const validation = validateExportData(userData);

      if (!validation.isValid) {
        console.warn('Export data validation warnings:', validation.errors);
      }

      // Compress data for efficiency
      userData = compressExportData(userData);

      switch (options.format) {
        case 'json':
          await this.exportAsJSON(userData, options, userId);
          break;
        case 'csv':
          await this.exportAsCSV(userData, options, userId);
          break;
        case 'pdf':
          await this.exportAsPDF(userData, options, userId);
          break;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export user data');
    }
  }

  private async gatherUserData(
    userId: string,
    options: ExportOptions
  ): Promise<UserDataExport> {
    const userData: UserDataExport = {
      exportDate: new Date().toISOString(),
      user: {},
      courses: [],
      quests: [],
      todos: [],
      studySessions: [],
      pomodoroSessions: [],
      achievements: [],
      pet: null,
      routines: [],
      analytics: {
        totalStudyTime: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        streakDays: 0,
        level: 0,
        totalXP: 0,
      },
    };

    // Get user profile data
    if (options.includePersonalData) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        userData.user = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          profile: {
            firstName: profile.first_name,
            lastName: profile.last_name,
            timezone: profile.timezone,
            bio: profile.bio,
          },
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
        };
      }
    }

    // Get game stats
    if (options.includeGameData) {
      const { data: gameStats } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (gameStats) {
        userData.analytics.level = gameStats.level;
        userData.analytics.totalXP = gameStats.total_xp;
        userData.analytics.streakDays = gameStats.streak_days;
      }

      // Get pet data
      const { data: pet } = await supabase
        .from('study_pets')
        .select(
          `
          *,
          pet_species:species_id (*)
        `
        )
        .eq('user_id', userId)
        .single();

      if (pet) {
        userData.pet = {
          id: pet.id,
          userId: pet.user_id,
          name: pet.name,
          species: pet.pet_species,
          level: pet.level,
          happiness: pet.happiness,
          health: pet.health,
          evolution: pet.evolution_data,
          accessories: pet.accessories || [],
          lastFed: new Date(pet.last_fed),
          lastPlayed: new Date(pet.last_played),
          createdAt: new Date(pet.created_at),
        };
      }

      // Get achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement_definitions (*)
        `
        )
        .eq('user_id', userId);

      if (achievements) {
        userData.achievements = achievements.map(ach => ({
          id: ach.achievement_definitions.id,
          title: ach.achievement_definitions.title,
          description: ach.achievement_definitions.description,
          category: ach.achievement_definitions.category,
          rarity: ach.achievement_definitions.rarity,
          xpReward: ach.achievement_definitions.xp_reward,
          iconUrl: ach.achievement_definitions.icon_url,
          unlockedAt: new Date(ach.unlocked_at),
        }));
      }
    }

    // Get study data
    if (options.includeStudyData) {
      let courseQuery = supabase
        .from('courses')
        .select(
          `
          *,
          course_progress (*)
        `
        )
        .eq('user_id', userId);

      const { data: courses } = await courseQuery;
      if (courses) {
        userData.courses = courses.map(course => ({
          id: course.id,
          name: course.name,
          description: course.description,
          color: course.color,
          syllabus: course.syllabus_data || [],
          progress: course.course_progress?.[0] || {
            completionPercentage: 0,
            hoursStudied: 0,
            topicsCompleted: 0,
            totalTopics: 0,
            lastStudied: new Date(),
          },
          createdAt: new Date(course.created_at),
          updatedAt: new Date(course.updated_at),
        }));
      }

      // Get quests
      let questQuery = supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId);

      if (options.dateRange) {
        questQuery = questQuery
          .gte('created_at', options.dateRange.start.toISOString())
          .lte('created_at', options.dateRange.end.toISOString());
      }

      const { data: quests } = await questQuery;
      if (quests) {
        userData.quests = quests.map(quest => ({
          id: quest.id,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          xpReward: quest.xp_reward,
          difficulty: quest.difficulty,
          requirements: quest.requirements || [],
          status: quest.status,
          courseId: quest.course_id,
          createdAt: new Date(quest.created_at),
          expiresAt: quest.expires_at ? new Date(quest.expires_at) : undefined,
          completedAt: quest.completed_at
            ? new Date(quest.completed_at)
            : undefined,
        }));
      }

      // Get study sessions
      let sessionQuery = supabase
        .from('study_sessions')
        .select(
          `
          *,
          courses (name),
          todo_items (title)
        `
        )
        .eq('user_id', userId);

      if (options.dateRange) {
        sessionQuery = sessionQuery
          .gte('started_at', options.dateRange.start.toISOString())
          .lte('started_at', options.dateRange.end.toISOString());
      }

      const { data: sessions } = await sessionQuery;
      if (sessions) {
        userData.studySessions = sessions.map(session => ({
          id: session.id,
          courseId: session.course_id,
          todoItemId: session.todo_item_id,
          questId: session.quest_id,
          startTime: new Date(session.started_at),
          endTime: session.ended_at ? new Date(session.ended_at) : undefined,
          duration: session.duration,
          type: session.type,
          xpEarned: session.xp_earned,
          notes: session.notes,
        }));

        // Calculate analytics
        userData.analytics.totalSessions = sessions.length;
        userData.analytics.totalStudyTime = sessions.reduce(
          (total, s) => total + s.duration,
          0
        );
        userData.analytics.averageSessionLength =
          userData.analytics.totalSessions > 0
            ? userData.analytics.totalStudyTime /
              userData.analytics.totalSessions
            : 0;
      }
    }

    return userData;
  }

  private async exportAsJSON(
    userData: UserDataExport,
    options: ExportOptions,
    userId: string
  ): Promise<void> {
    const jsonString = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = generateExportFilename(options, userId);
    saveAs(blob, filename);
  }

  private async exportAsCSV(
    userData: UserDataExport,
    options: ExportOptions,
    userId: string
  ): Promise<void> {
    const baseFilename = generateExportFilename(options, userId).replace(
      '.csv',
      ''
    );

    // Export courses
    if (userData.courses && userData.courses.length > 0) {
      const flattenedCourses = flattenForCSV(userData.courses);
      const coursesCSV = Papa.unparse(flattenedCourses);
      const coursesBlob = new Blob([coursesCSV], { type: 'text/csv' });
      saveAs(coursesBlob, `${baseFilename}-courses.csv`);
    }

    // Export study sessions
    if (userData.studySessions && userData.studySessions.length > 0) {
      const flattenedSessions = flattenForCSV(userData.studySessions);
      const sessionsCSV = Papa.unparse(flattenedSessions);
      const sessionsBlob = new Blob([sessionsCSV], { type: 'text/csv' });
      saveAs(sessionsBlob, `${baseFilename}-sessions.csv`);
    }

    // Export quests
    if (userData.quests && userData.quests.length > 0) {
      const flattenedQuests = flattenForCSV(userData.quests);
      const questsCSV = Papa.unparse(flattenedQuests);
      const questsBlob = new Blob([questsCSV], { type: 'text/csv' });
      saveAs(questsBlob, `${baseFilename}-quests.csv`);
    }

    // Export achievements
    if (userData.achievements && userData.achievements.length > 0) {
      const flattenedAchievements = flattenForCSV(userData.achievements);
      const achievementsCSV = Papa.unparse(flattenedAchievements);
      const achievementsBlob = new Blob([achievementsCSV], {
        type: 'text/csv',
      });
      saveAs(achievementsBlob, `${baseFilename}-achievements.csv`);
    }

    // Export todos if present
    if (userData.todos && userData.todos.length > 0) {
      const flattenedTodos = flattenForCSV(userData.todos);
      const todosCSV = Papa.unparse(flattenedTodos);
      const todosBlob = new Blob([todosCSV], { type: 'text/csv' });
      saveAs(todosBlob, `${baseFilename}-todos.csv`);
    }

    // Export routines if present
    if (userData.routines && userData.routines.length > 0) {
      const flattenedRoutines = flattenForCSV(userData.routines);
      const routinesCSV = Papa.unparse(flattenedRoutines);
      const routinesBlob = new Blob([routinesCSV], { type: 'text/csv' });
      saveAs(routinesBlob, `${baseFilename}-routines.csv`);
    }
  }

  private async exportAsPDF(
    userData: UserDataExport,
    options: ExportOptions,
    userId: string
  ): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('Study Platform Data Export', pageWidth / 2, yPosition, {
      align: 'center',
    });
    yPosition += 20;

    // Export date
    pdf.setFontSize(12);
    pdf.text(
      `Export Date: ${format(new Date(userData.exportDate), 'PPP')}`,
      20,
      yPosition
    );
    yPosition += 15;

    // User info
    if (userData.user.username) {
      pdf.setFontSize(16);
      pdf.text('User Information', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Username: ${userData.user.username}`, 20, yPosition);
      yPosition += 8;

      if (userData.user.profile?.firstName || userData.user.profile?.lastName) {
        const fullName =
          `${userData.user.profile?.firstName || ''} ${userData.user.profile?.lastName || ''}`.trim();
        pdf.text(`Name: ${fullName}`, 20, yPosition);
        yPosition += 8;
      }

      yPosition += 10;
    }

    // Analytics summary
    pdf.setFontSize(16);
    pdf.text('Study Analytics', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text(`Level: ${userData.analytics.level}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total XP: ${userData.analytics.totalXP}`, 20, yPosition);
    yPosition += 8;
    pdf.text(
      `Study Streak: ${userData.analytics.streakDays} days`,
      20,
      yPosition
    );
    yPosition += 8;
    pdf.text(
      `Total Study Time: ${Math.round(userData.analytics.totalStudyTime / 60)} hours`,
      20,
      yPosition
    );
    yPosition += 8;
    pdf.text(
      `Total Sessions: ${userData.analytics.totalSessions}`,
      20,
      yPosition
    );
    yPosition += 15;

    // Courses summary
    if (userData.courses && userData.courses.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Courses', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      userData.courses.slice(0, 10).forEach(course => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(
          `• ${course.name} (${course.progress.completionPercentage}% complete)`,
          20,
          yPosition
        );
        yPosition += 8;
      });

      if (userData.courses.length > 10) {
        pdf.text(
          `... and ${userData.courses.length - 10} more courses`,
          20,
          yPosition
        );
        yPosition += 8;
      }

      yPosition += 10;
    }

    // Recent achievements
    if (userData.achievements && userData.achievements.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Recent Achievements', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      userData.achievements.slice(0, 5).forEach(achievement => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(
          `• ${achievement.title} (${achievement.rarity})`,
          20,
          yPosition
        );
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Pet info
    if (userData.pet) {
      pdf.setFontSize(16);
      pdf.text('Study Pet', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Name: ${userData.pet.name}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Species: ${userData.pet.species.name}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Level: ${userData.pet.level}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Happiness: ${userData.pet.happiness}%`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Health: ${userData.pet.health}%`, 20, yPosition);
    }

    const filename = generateExportFilename(options, userId);
    pdf.save(filename);
  }

  async createBackup(userId: string): Promise<string> {
    try {
      const fullExportOptions: ExportOptions = {
        format: 'json',
        includePersonalData: true,
        includeProgressData: true,
        includeGameData: true,
        includeStudyData: true,
      };

      const userData = await this.gatherUserData(userId, fullExportOptions);

      // Store backup in Supabase storage
      const backupData = JSON.stringify(userData, null, 2);
      const filename = `backup-${userId}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;

      const { data, error } = await supabase.storage
        .from('user-backups')
        .upload(filename, backupData, {
          contentType: 'application/json',
        });

      if (error) throw error;

      // Record backup in database
      const { error: dbError } = await supabase.from('user_backups').insert({
        user_id: userId,
        filename: filename,
        file_path: data.path,
        backup_type: 'full',
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      return filename;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error('Failed to create backup');
    }
  }

  async restoreFromBackup(
    userId: string,
    backupFilename: string
  ): Promise<void> {
    try {
      // Download backup file
      const { data, error } = await supabase.storage
        .from('user-backups')
        .download(backupFilename);

      if (error) throw error;

      const backupText = await data.text();
      const backupData: UserDataExport = JSON.parse(backupText);

      // This is a simplified restore - in production, you'd want more sophisticated logic
      console.log('Backup data ready for restore:', backupData);

      // Note: Actual restoration would require careful handling of foreign keys,
      // conflict resolution, and user confirmation
      throw new Error(
        'Restore functionality requires additional implementation for safety'
      );
    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw new Error('Failed to restore from backup');
    }
  }

  async listUserBackups(userId: string) {
    const { data, error } = await supabase
      .from('user_backups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async deleteBackup(userId: string, backupId: string): Promise<void> {
    // Get backup info
    const { data: backup, error: fetchError } = await supabase
      .from('user_backups')
      .select('*')
      .eq('id', backupId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-backups')
      .remove([backup.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('user_backups')
      .delete()
      .eq('id', backupId)
      .eq('user_id', userId);

    if (dbError) throw dbError;
  }
}

export const exportService = new ExportService();
