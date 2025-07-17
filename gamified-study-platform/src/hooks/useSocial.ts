import { useCallback } from 'react';
import { useSocialStore } from '../store/socialStore';
import type { 
  CreateGroupForm, 
  JoinGroupForm, 
  GroupInviteForm, 
  CreateChallengeForm,
  StudyRoomForm,
  GroupFilters,
  ChallengeFilters,
  LeaderboardType,
  LeaderboardPeriod,
  MessageType
} from '../types';

export const useSocial = () => {
  const store = useSocialStore();

  // Group management
  const createGroup = useCallback(async (groupData: CreateGroupForm) => {
    return store.createGroup(groupData);
  }, [store]);

  const joinGroup = useCallback(async (joinData: JoinGroupForm) => {
    return store.joinGroup(joinData);
  }, [store]);

  const leaveGroup = useCallback(async (groupId: string) => {
    return store.leaveGroup(groupId);
  }, [store]);

  const updateGroup = useCallback(async (groupId: string, updates: Partial<CreateGroupForm>) => {
    return store.updateGroup(groupId, updates);
  }, [store]);

  const searchGroups = useCallback(async (filters: GroupFilters) => {
    return store.searchGroups(filters);
  }, [store]);

  // Member management
  const inviteToGroup = useCallback(async (inviteData: GroupInviteForm) => {
    return store.inviteToGroup(inviteData);
  }, [store]);

  const respondToInvitation = useCallback(async (invitationId: string, accept: boolean) => {
    return store.respondToInvitation(invitationId, accept);
  }, [store]);

  // Challenge management
  const createChallenge = useCallback(async (challengeData: CreateChallengeForm) => {
    return store.createChallenge(challengeData);
  }, [store]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    return store.joinChallenge(challengeId);
  }, [store]);

  // Study room management
  const createStudyRoom = useCallback(async (roomData: StudyRoomForm) => {
    return store.createStudyRoom(roomData);
  }, [store]);

  const joinStudyRoom = useCallback(async (roomId: string) => {
    return store.joinStudyRoom(roomId);
  }, [store]);

  const leaveStudyRoom = useCallback(async (roomId: string) => {
    return store.leaveStudyRoom(roomId);
  }, [store]);

  // Messaging
  const sendMessage = useCallback(async (groupId: string, content: string, type?: MessageType) => {
    return store.sendMessage(groupId, content, type);
  }, [store]);

  // Data fetching
  const fetchMyGroups = useCallback(() => {
    return store.fetchMyGroups();
  }, [store]);

  const fetchGroupById = useCallback((groupId: string) => {
    return store.fetchGroupById(groupId);
  }, [store]);

  const fetchGroupChallenges = useCallback((groupId: string, filters?: ChallengeFilters) => {
    return store.fetchGroupChallenges(groupId, filters);
  }, [store]);

  const fetchStudyRooms = useCallback((groupId: string) => {
    return store.fetchStudyRooms(groupId);
  }, [store]);

  const fetchLeaderboard = useCallback((groupId: string, type: LeaderboardType, period: LeaderboardPeriod) => {
    return store.fetchLeaderboard(groupId, type, period);
  }, [store]);

  const fetchGroupActivities = useCallback((groupId: string) => {
    return store.fetchGroupActivities(groupId);
  }, [store]);

  const fetchGroupMessages = useCallback((groupId: string) => {
    return store.fetchGroupMessages(groupId);
  }, [store]);

  const fetchGroupInvitations = useCallback(() => {
    return store.fetchGroupInvitations();
  }, [store]);

  // Utility functions
  const setActiveGroup = useCallback((group: any) => {
    store.setActiveGroup(group);
  }, [store]);

  const setActiveStudyRoom = useCallback((room: any) => {
    store.setActiveStudyRoom(room);
  }, [store]);

  const clearError = useCallback(() => {
    store.clearError();
  }, [store]);

  const reset = useCallback(() => {
    store.reset();
  }, [store]);

  return {
    // State
    groups: store.groups,
    activeGroup: store.activeGroup,
    invitations: store.invitations,
    challenges: store.challenges,
    studyRooms: store.studyRooms,
    activeStudyRoom: store.activeStudyRoom,
    leaderboards: store.leaderboards,
    activities: store.activities,
    messages: store.messages,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    createGroup,
    joinGroup,
    leaveGroup,
    updateGroup,
    searchGroups,
    inviteToGroup,
    respondToInvitation,
    createChallenge,
    joinChallenge,
    createStudyRoom,
    joinStudyRoom,
    leaveStudyRoom,
    sendMessage,
    fetchMyGroups,
    fetchGroupById,
    fetchGroupChallenges,
    fetchStudyRooms,
    fetchLeaderboard,
    fetchGroupActivities,
    fetchGroupMessages,
    fetchGroupInvitations,
    setActiveGroup,
    setActiveStudyRoom,
    clearError,
    reset,
  };
};

export default useSocial;