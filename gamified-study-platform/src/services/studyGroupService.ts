import { supabase } from '../lib/supabase';
import type {
  StudyGroup,
  GroupMember,
  GroupChallenge,
  StudyRoom,
  GroupInvitation,
  GroupActivity,
  GroupLeaderboard,
  CreateGroupForm,
  JoinGroupForm,
  GroupInviteForm,
  CreateChallengeForm,
  StudyRoomForm,
  GroupFilters,
  ChallengeFilters,
  LeaderboardType,
  LeaderboardPeriod,
  InvitationStatus,
  ChallengeStatus,
  GroupMessage,
  MessageType,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

class StudyGroupService {
  // Group Management
  async createGroup(groupData: CreateGroupForm): Promise<StudyGroup> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const inviteCode = this.generateInviteCode();

    const { data, error } = await supabase
      .from('study_groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        invite_code: inviteCode,
        max_members: groupData.maxMembers,
        is_private: groupData.isPrivate,
        created_by: user.data.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    await this.addMemberToGroup(data.id, user.data.user.id, 'owner');

    return {
      ...this.mapDatabaseGroupToStudyGroup(data),
      members: [],
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        totalStudyHours: 0,
        totalQuestsCompleted: 0,
        groupXP: 0,
        averageLevel: 1,
        weeklyProgress: {
          totalXP: 0,
          totalStudyTime: 0,
          totalQuestsCompleted: 0,
          activeMembers: 1,
          groupChallengesCompleted: 0,
        },
        achievements: [],
      },
      settings: {
        allowInvites: true,
        requireApproval: false,
        shareProgress: true,
        enableCompetition: true,
        enableGroupChallenges: true,
        studyRoomEnabled: true,
        notificationSettings: {
          memberJoined: true,
          memberLeft: true,
          challengeStarted: true,
          challengeCompleted: true,
          milestoneReached: true,
          studySessionStarted: false,
        },
      },
    };
  }

  async getMyGroups(): Promise<StudyGroup[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('group_memberships')
      .select(
        `
        group_id,
        study_groups (
          id,
          name,
          description,
          invite_code,
          max_members,
          is_private,
          created_by,
          created_at,
          updated_at
        )
      `
      )
      .eq('user_id', user.data.user.id);

    if (error) throw error;

    const groups = await Promise.all(
      data.map(async (membership: any) => {
        const group = membership.study_groups;
        const members = await this.getGroupMembers(group.id);
        const stats = await this.calculateGroupStats(group.id);

        return {
          ...this.mapDatabaseGroupToStudyGroup(group),
          members,
          stats,
          settings: this.getDefaultGroupSettings(),
        };
      })
    );

    return groups;
  }

  async getGroupById(groupId: string): Promise<StudyGroup> {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;

    const members = await this.getGroupMembers(groupId);
    const stats = await this.calculateGroupStats(groupId);

    return {
      ...this.mapDatabaseGroupToStudyGroup(data),
      members,
      stats,
      settings: this.getDefaultGroupSettings(),
    };
  }

  async joinGroup(joinData: JoinGroupForm): Promise<StudyGroup> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Find group by invite code
    const { data: groupData, error: groupError } = await supabase
      .from('study_groups')
      .select('*')
      .eq('invite_code', joinData.inviteCode)
      .single();

    if (groupError) throw new Error('Invalid invite code');

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('group_memberships')
      .select('id')
      .eq('group_id', groupData.id)
      .eq('user_id', user.data.user.id)
      .single();

    if (existingMembership) {
      throw new Error('You are already a member of this group');
    }

    // Check member limit
    const currentMemberCount = await this.getGroupMemberCount(groupData.id);
    if (currentMemberCount >= groupData.max_members) {
      throw new Error('Group is full');
    }

    await this.addMemberToGroup(groupData.id, user.data.user.id, 'member');

    // Log activity
    await this.logGroupActivity(
      groupData.id,
      user.data.user.id,
      'member_joined',
      'joined the group'
    );

    return this.getGroupById(groupData.id);
  }

  async leaveGroup(groupId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.data.user.id);

    if (error) throw error;

    // Log activity
    await this.logGroupActivity(
      groupId,
      user.data.user.id,
      'member_left',
      'left the group'
    );
  }

  async updateGroup(
    groupId: string,
    updates: Partial<CreateGroupForm>
  ): Promise<StudyGroup> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Check if user is owner or admin
    const userRole = await this.getUserRoleInGroup(groupId, user.data.user.id);
    if (!userRole || !['owner', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('study_groups')
      .update({
        name: updates.name,
        description: updates.description,
        max_members: updates.maxMembers,
        is_private: updates.isPrivate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return this.getGroupById(groupId);
  }

  // Member Management
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
      .from('group_memberships')
      .select(
        `
        id,
        user_id,
        group_id,
        role,
        joined_at,
        user_profiles (
          username,
          avatar_url
        ),
        game_stats (
          level,
          total_xp,
          streak_days,
          last_activity
        )
      `
      )
      .eq('group_id', groupId);

    if (error) throw error;

    return data.map((membership: any) => ({
      id: membership.id,
      userId: membership.user_id,
      groupId: membership.group_id,
      role: membership.role,
      username: membership.user_profiles?.username || 'Unknown',
      avatarUrl: membership.user_profiles?.avatar_url,
      joinedAt: new Date(membership.joined_at),
      stats: {
        totalXP: membership.game_stats?.total_xp || 0,
        level: membership.game_stats?.level || 1,
        studyHours: 0, // TODO: Calculate from study sessions
        questsCompleted: 0, // TODO: Calculate from quests
        streakDays: membership.game_stats?.streak_days || 0,
        contributionScore: 0, // TODO: Calculate contribution score
        weeklyProgress: {
          xpEarned: 0,
          studyTime: 0,
          questsCompleted: 0,
          achievementsUnlocked: 0,
        },
      },
      isActive: this.isUserActive(membership.game_stats?.last_activity),
      lastSeen: new Date(
        membership.game_stats?.last_activity || membership.joined_at
      ),
    }));
  }

  async inviteToGroup(inviteData: GroupInviteForm): Promise<GroupInvitation> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Check if user has permission to invite
    const userRole = await this.getUserRoleInGroup(
      inviteData.groupId,
      user.data.user.id
    );
    if (!userRole) throw new Error('You are not a member of this group');

    const group = await this.getGroupById(inviteData.groupId);

    // Find target user
    let targetUserId: string;
    if (inviteData.username) {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', inviteData.username)
        .single();

      if (userError) throw new Error('User not found');
      targetUserId = userData.id;
    } else {
      throw new Error('Username is required');
    }

    // Create invitation
    const invitation: GroupInvitation = {
      id: uuidv4(),
      groupId: inviteData.groupId,
      groupName: group.name,
      invitedBy: user.data.user.id,
      invitedByUsername: '', // TODO: Get from user profile
      invitedUser: targetUserId,
      inviteCode: group.inviteCode,
      message: inviteData.message,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    };

    // TODO: Store invitation in database
    return invitation;
  }

  // Challenge Management
  async createChallenge(
    challengeData: CreateChallengeForm
  ): Promise<GroupChallenge> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // Check permissions
    const userRole = await this.getUserRoleInGroup(
      challengeData.groupId,
      user.data.user.id
    );
    if (!userRole || !['owner', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions');
    }

    const challenge: GroupChallenge = {
      id: uuidv4(),
      groupId: challengeData.groupId,
      title: challengeData.title,
      description: challengeData.description,
      type: challengeData.type,
      goal: {
        ...challengeData.goal,
        description: challengeData.description,
      },
      rewards: challengeData.rewards,
      participants: [],
      status: 'upcoming',
      startDate: new Date(),
      endDate: new Date(
        Date.now() + challengeData.duration * 24 * 60 * 60 * 1000
      ),
      createdBy: user.data.user.id,
      createdAt: new Date(),
    };

    // TODO: Store challenge in database
    await this.logGroupActivity(
      challengeData.groupId,
      user.data.user.id,
      'challenge_started',
      `created challenge: ${challengeData.title}`
    );

    return challenge;
  }

  async getGroupChallenges(
    groupId: string,
    filters?: ChallengeFilters
  ): Promise<GroupChallenge[]> {
    // TODO: Implement database query with filters
    return [];
  }

  async joinChallenge(challengeId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // TODO: Add user to challenge participants
  }

  // Study Room Management
  async createStudyRoom(roomData: StudyRoomForm): Promise<StudyRoom> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const studyRoom: StudyRoom = {
      id: uuidv4(),
      groupId: roomData.groupId,
      name: roomData.name,
      description: roomData.description,
      isActive: true,
      participants: [],
      settings: {
        allowChat: true,
        syncPomodoro: false,
        shareProgress: true,
        requirePermissionToJoin: false,
        maxParticipants: 10,
        backgroundMusic: false,
        focusMode: false,
        ...roomData.settings,
      },
      createdBy: user.data.user.id,
      createdAt: new Date(),
    };

    // TODO: Store study room in database
    return studyRoom;
  }

  async getGroupStudyRooms(groupId: string): Promise<StudyRoom[]> {
    // TODO: Implement database query
    return [];
  }

  async joinStudyRoom(roomId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    // TODO: Add user to study room participants
  }

  // Leaderboard Management
  async getGroupLeaderboard(
    groupId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod
  ): Promise<GroupLeaderboard> {
    const members = await this.getGroupMembers(groupId);

    // Sort members based on leaderboard type
    const sortedMembers = members.sort((a, b) => {
      switch (type) {
        case 'xp':
          return b.stats.totalXP - a.stats.totalXP;
        case 'study_time':
          return b.stats.studyHours - a.stats.studyHours;
        case 'quests_completed':
          return b.stats.questsCompleted - a.stats.questsCompleted;
        case 'streak_days':
          return b.stats.streakDays - a.stats.streakDays;
        default:
          return 0;
      }
    });

    const entries = sortedMembers.map((member, index) => ({
      rank: index + 1,
      userId: member.userId,
      username: member.username,
      avatarUrl: member.avatarUrl,
      value: this.getLeaderboardValue(member, type),
      change: 0, // TODO: Calculate change from previous period
      isCurrentUser: false, // TODO: Check if current user
    }));

    return {
      id: uuidv4(),
      groupId,
      type,
      period,
      entries,
      lastUpdated: new Date(),
    };
  }

  // Activity Management
  async getGroupActivities(
    groupId: string,
    limit = 50
  ): Promise<GroupActivity[]> {
    // TODO: Implement database query for group activities
    return [];
  }

  async logGroupActivity(
    groupId: string,
    userId: string,
    type: GroupActivity['type'],
    description: string,
    data?: Record<string, any>
  ): Promise<void> {
    // TODO: Store activity in database
  }

  // Message Management
  async getGroupMessages(groupId: string, limit = 50): Promise<GroupMessage[]> {
    // TODO: Implement database query for group messages
    return [];
  }

  async sendGroupMessage(
    groupId: string,
    content: string,
    type: MessageType = 'text'
  ): Promise<GroupMessage> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const message: GroupMessage = {
      id: uuidv4(),
      groupId,
      userId: user.data.user.id,
      username: '', // TODO: Get from user profile
      content,
      type,
      reactions: [],
      timestamp: new Date(),
      isDeleted: false,
    };

    // TODO: Store message in database
    return message;
  }

  // Search and Discovery
  async searchGroups(filters: GroupFilters): Promise<StudyGroup[]> {
    let query = supabase.from('study_groups').select('*');

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.isPrivate !== undefined) {
      query = query.eq('is_private', filters.isPrivate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // TODO: Apply additional filters and return mapped groups
    return [];
  }

  // Helper Methods
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async addMemberToGroup(
    groupId: string,
    userId: string,
    role: GroupMember['role']
  ): Promise<void> {
    const { error } = await supabase.from('group_memberships').insert({
      group_id: groupId,
      user_id: userId,
      role,
    });

    if (error) throw error;
  }

  private async getGroupMemberCount(groupId: string): Promise<number> {
    const { count, error } = await supabase
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count || 0;
  }

  private async getUserRoleInGroup(
    groupId: string,
    userId: string
  ): Promise<GroupMember['role'] | null> {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data.role;
  }

  private async calculateGroupStats(groupId: string) {
    const members = await this.getGroupMembers(groupId);

    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.isActive).length,
      totalStudyHours: members.reduce((sum, m) => sum + m.stats.studyHours, 0),
      totalQuestsCompleted: members.reduce(
        (sum, m) => sum + m.stats.questsCompleted,
        0
      ),
      averageLevel:
        members.length > 0
          ? members.reduce((sum, m) => sum + m.stats.level, 0) / members.length
          : 0,
      groupXP: members.reduce((sum, m) => sum + m.stats.totalXP, 0),
      weeklyProgress: {
        totalXP: members.reduce(
          (sum, m) => sum + m.stats.weeklyProgress.xpEarned,
          0
        ),
        totalStudyTime: members.reduce(
          (sum, m) => sum + m.stats.weeklyProgress.studyTime,
          0
        ),
        totalQuestsCompleted: members.reduce(
          (sum, m) => sum + m.stats.weeklyProgress.questsCompleted,
          0
        ),
        activeMembers: members.filter(m => m.isActive).length,
        groupChallengesCompleted: 0,
      },
      achievements: [],
    };
  }

  private getDefaultGroupSettings() {
    return {
      allowInvites: true,
      requireApproval: false,
      shareProgress: true,
      enableCompetition: true,
      enableGroupChallenges: true,
      studyRoomEnabled: true,
      notificationSettings: {
        memberJoined: true,
        memberLeft: true,
        challengeStarted: true,
        challengeCompleted: true,
        milestoneReached: true,
        studySessionStarted: false,
      },
    };
  }

  private isUserActive(lastActivity?: string): boolean {
    if (!lastActivity) return false;
    const lastActiveDate = new Date(lastActivity);
    const daysSinceActive =
      (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActive <= 7; // Active if seen within last 7 days
  }

  private getLeaderboardValue(
    member: GroupMember,
    type: LeaderboardType
  ): number {
    switch (type) {
      case 'xp':
        return member.stats.totalXP;
      case 'study_time':
        return member.stats.studyHours;
      case 'quests_completed':
        return member.stats.questsCompleted;
      case 'streak_days':
        return member.stats.streakDays;
      case 'contribution':
        return member.stats.contributionScore;
      default:
        return 0;
    }
  }

  private mapDatabaseGroupToStudyGroup(
    dbGroup: any
  ): Omit<StudyGroup, 'members' | 'stats' | 'settings'> {
    return {
      id: dbGroup.id,
      name: dbGroup.name,
      description: dbGroup.description,
      inviteCode: dbGroup.invite_code,
      maxMembers: dbGroup.max_members,
      isPrivate: dbGroup.is_private,
      createdBy: dbGroup.created_by,
      createdAt: new Date(dbGroup.created_at),
      updatedAt: new Date(dbGroup.updated_at),
    };
  }
}

export const studyGroupService = new StudyGroupService();
