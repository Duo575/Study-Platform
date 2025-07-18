import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { LoginForm, RegisterForm } from '../types';
import { mockAuthService } from './mockAuth';

export interface AuthUser extends User {
  profile?: {
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export class AuthService {
  // Sign up new user
  static async signUp(data: RegisterForm) {
    const { email, password, username } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) throw authError;

    // Create user profile after successful signup
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              studyReminders: true,
              achievementUnlocks: true,
              petReminders: true,
            },
            studyReminders: true,
            pomodoroSettings: {
              workDuration: 25,
              shortBreakDuration: 5,
              longBreakDuration: 15,
              sessionsUntilLongBreak: 4,
              soundEnabled: true,
            },
          },
        });

      if (profileError) throw profileError;

      // Initialize game stats
      const { error: gameStatsError } = await supabase
        .from('game_stats')
        .insert({
          user_id: authData.user.id,
          level: 1,
          total_xp: 0,
          current_xp: 0,
          streak_days: 0,
          last_activity: new Date().toISOString(),
          weekly_stats: {
            studyHours: 0,
            questsCompleted: 0,
            streakMaintained: false,
            xpEarned: 0,
          },
        });

      if (gameStatsError) throw gameStatsError;
    }

    return authData;
  }

  // Sign in existing user
  static async signIn(data: LoginForm) {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return authData;
  }

  // Sign out current user
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current session
  static async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // Get current user with profile
  static async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username, first_name, last_name, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      ...user,
      profile: profile
        ? {
            username: profile.username,
            firstName: profile.first_name || undefined,
            lastName: profile.last_name || undefined,
            avatarUrl: profile.avatar_url || undefined,
          }
        : undefined,
    };
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  // Update user profile
  static async updateProfile(updates: {
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        username: updates.username,
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
  }

  // Upload avatar
  static async uploadAvatar(file: File): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
