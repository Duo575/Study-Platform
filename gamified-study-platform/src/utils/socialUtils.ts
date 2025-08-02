import type {
  StudyGroup,
  GroupMember,
  GroupChallenge,
  StudyRoom,
  GroupMessage,
  LeaderboardType,
  ChallengeType,
  ParticipantStatus,
} from '../types';

/**
 * Generate a random invite code for study groups
 */
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calculate group activity level based on member activity
 */
export const calculateGroupActivityLevel = (
  group: StudyGroup
): 'high' | 'medium' | 'low' => {
  const activityRate =
    group.stats.totalMembers > 0
      ? group.stats.activeMembers / group.stats.totalMembers
      : 0;

  if (activityRate >= 0.7) return 'high';
  if (activityRate >= 0.4) return 'medium';
  return 'low';
};

/**
 * Get activity level color for UI display
 */
export const getActivityLevelColor = (
  level: 'high' | 'medium' | 'low'
): string => {
  switch (level) {
    case 'high':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-red-600 bg-red-100';
  }
};

/**
 * Get activity level text for UI display
 */
export const getActivityLevelText = (
  level: 'high' | 'medium' | 'low'
): string => {
  switch (level) {
    case 'high':
      return 'Very Active';
    case 'medium':
      return 'Moderately Active';
    case 'low':
      return 'Low Activity';
  }
};

/**
 * Calculate member contribution score based on various factors
 */
export const calculateContributionScore = (member: GroupMember): number => {
  const { stats } = member;

  // Weight different factors
  const xpWeight = 0.3;
  const studyTimeWeight = 0.25;
  const questsWeight = 0.2;
  const streakWeight = 0.15;
  const weeklyWeight = 0.1;

  // Normalize values (assuming reasonable maximums)
  const normalizedXP = Math.min(stats.totalXP / 10000, 1);
  const normalizedStudyTime = Math.min(stats.studyHours / 100, 1);
  const normalizedQuests = Math.min(stats.questsCompleted / 50, 1);
  const normalizedStreak = Math.min(stats.streakDays / 30, 1);
  const normalizedWeekly = Math.min(stats.weeklyProgress.xpEarned / 1000, 1);

  const score =
    (normalizedXP * xpWeight +
      normalizedStudyTime * studyTimeWeight +
      normalizedQuests * questsWeight +
      normalizedStreak * streakWeight +
      normalizedWeekly * weeklyWeight) *
    100;

  return Math.round(score);
};

/**
 * Format leaderboard values for display
 */
export const formatLeaderboardValue = (
  value: number,
  type: LeaderboardType
): string => {
  switch (type) {
    case 'xp':
      return value.toLocaleString();
    case 'study_time': {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours}h ${minutes}m`;
    }
    case 'quests_completed':
      return value.toString();
    case 'streak_days':
      return `${value} days`;
    case 'contribution':
      return value.toString();
    default:
      return value.toString();
  }
};

/**
 * Get challenge type icon and color
 */
export const getChallengeTypeInfo = (type: ChallengeType) => {
  switch (type) {
    case 'study_time':
      return { icon: 'Clock', color: 'text-blue-500' };
    case 'quest_completion':
      return { icon: 'Target', color: 'text-green-500' };
    case 'streak_maintenance':
      return { icon: 'Zap', color: 'text-orange-500' };
    case 'collaboration':
      return { icon: 'Users', color: 'text-purple-500' };
    default:
      return { icon: 'BookOpen', color: 'text-indigo-500' };
  }
};

/**
 * Calculate challenge progress percentage
 */
export const calculateChallengeProgress = (
  challenge: GroupChallenge
): number => {
  if (challenge.goal.isCollective) {
    const totalProgress = challenge.participants.reduce(
      (sum, p) => sum + p.progress,
      0
    );
    return Math.min((totalProgress / challenge.goal.target) * 100, 100);
  } else {
    const completedParticipants = challenge.participants.filter(
      p => p.completed
    ).length;
    return challenge.participants.length > 0
      ? (completedParticipants / challenge.participants.length) * 100
      : 0;
  }
};

/**
 * Get participant status color and icon
 */
export const getParticipantStatusInfo = (status: ParticipantStatus) => {
  switch (status) {
    case 'studying':
      return { color: 'bg-green-500', icon: 'BookOpen' };
    case 'break':
      return { color: 'bg-yellow-500', icon: 'Coffee' };
    case 'away':
      return { color: 'bg-orange-500', icon: 'Clock' };
    case 'offline':
      return { color: 'bg-gray-400', icon: 'EyeOff' };
  }
};

/**
 * Check if a user is considered active based on last activity
 */
export const isUserActive = (lastActivity?: Date): boolean => {
  if (!lastActivity) return false;
  const daysSinceActive =
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceActive <= 7; // Active if seen within last 7 days
};

/**
 * Group messages by sender for better chat display
 */
export const groupMessagesBySender = (
  messages: GroupMessage[]
): GroupMessage[][] => {
  return messages.reduce((groups: GroupMessage[][], message, index) => {
    if (index === 0 || messages[index - 1].userId !== message.userId) {
      groups.push([message]);
    } else {
      groups[groups.length - 1].push(message);
    }
    return groups;
  }, []);
};

/**
 * Get member role display information
 */
export const getMemberRoleInfo = (role: GroupMember['role']) => {
  switch (role) {
    case 'owner':
      return { icon: 'Crown', color: 'text-yellow-600', label: 'Owner' };
    case 'admin':
      return { icon: 'Shield', color: 'text-blue-600', label: 'Admin' };
    case 'member':
      return { icon: 'User', color: 'text-gray-600', label: 'Member' };
  }
};

/**
 * Calculate study room capacity percentage
 */
export const calculateRoomCapacity = (room: StudyRoom): number => {
  return (room.participants.length / room.settings.maxParticipants) * 100;
};

/**
 * Check if a study room is full
 */
export const isRoomFull = (room: StudyRoom): boolean => {
  return room.participants.length >= room.settings.maxParticipants;
};

/**
 * Generate a default group description based on group name
 */
export const generateDefaultGroupDescription = (groupName: string): string => {
  return `Welcome to ${groupName}! Let's study together and achieve our learning goals.`;
};

/**
 * Validate invite code format
 */
export const isValidInviteCode = (code: string): boolean => {
  return /^[A-Z0-9]{6,8}$/.test(code);
};

/**
 * Calculate group XP from all members
 */
export const calculateGroupXP = (members: GroupMember[]): number => {
  return members.reduce((total, member) => total + member.stats.totalXP, 0);
};

/**
 * Calculate average group level
 */
export const calculateAverageGroupLevel = (members: GroupMember[]): number => {
  if (members.length === 0) return 0;
  const totalLevels = members.reduce(
    (total, member) => total + member.stats.level,
    0
  );
  return totalLevels / members.length;
};

/**
 * Get group size category
 */
export const getGroupSizeCategory = (
  memberCount: number
): 'small' | 'medium' | 'large' => {
  if (memberCount <= 5) return 'small';
  if (memberCount <= 15) return 'medium';
  return 'large';
};

/**
 * Check if user can perform admin actions in group
 */
export const canPerformAdminActions = (
  userRole: GroupMember['role']
): boolean => {
  return ['owner', 'admin'].includes(userRole);
};

/**
 * Sort group members by role hierarchy
 */
export const sortMembersByRole = (members: GroupMember[]): GroupMember[] => {
  const roleOrder = { owner: 0, admin: 1, member: 2 };
  return [...members].sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
};

/**
 * Calculate time until challenge ends
 */
export const getTimeUntilChallengeEnd = (endDate: Date): string => {
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();

  if (timeDiff <= 0) return 'Ended';

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;

  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m`;
};

/**
 * Get recommended group settings based on privacy level
 */
export const getRecommendedGroupSettings = (isPrivate: boolean) => {
  return {
    allowInvites: true,
    requireApproval: isPrivate,
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
};
