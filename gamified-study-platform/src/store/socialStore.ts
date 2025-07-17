import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  SocialState,
  StudyGroup,
  GroupChallenge,
  StudyRoom,
  GroupInvitation,
  GroupActivity,
  GroupLeaderboard,
  GroupMessage,
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
import { studyGroupService } from '../services/studyGroupService';

interface SocialStore extends SocialState {
  // Group Actions
  createGroup: (groupData: CreateGroupForm) => Promise<void>;
  joinGroup: (joinData: JoinGroupForm) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<CreateGroupForm>) => Promise<void>;
  fetchMyGroups: () => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<void>;
  setActiveGroup: (group: StudyGroup | null) => void;
  searchGroups: (filters: GroupFilters) => Promise<StudyGroup[]>;

  // Member Actions
  inviteToGroup: (inviteData: GroupInviteForm) => Promise<void>;
  respondToInvitation: (invitationId: string, accept: boolean) => Promise<void>;
  fetchGroupInvitations: () => Promise<void>;

  // Challenge Actions
  createChallenge: (challengeData: CreateChallengeForm) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  fetchGroupChallenges: (groupId: string, filters?: ChallengeFilters) => Promise<void>;

  // Study Room Actions
  createStudyRoom: (roomData: StudyRoomForm) => Promise<void>;
  joinStudyRoom: (roomId: string) => Promise<void>;
  leaveStudyRoom: (roomId: string) => Promise<void>;
  fetchStudyRooms: (groupId: string) => Promise<void>;
  setActiveStudyRoom: (room: StudyRoom | null) => void;

  // Leaderboard Actions
  fetchLeaderboard: (groupId: string, type: LeaderboardType, period: LeaderboardPeriod) => Promise<void>;

  // Activity Actions
  fetchGroupActivities: (groupId: string) => Promise<void>;

  // Message Actions
  fetchGroupMessages: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, content: string, type?: MessageType) => Promise<void>;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: SocialState = {
  currentUser: null,
  groups: [],
  activeGroup: null,
  invitations: [],
  challenges: [],
  studyRooms: [],
  activeStudyRoom: null,
  leaderboards: [],
  activities: [],
  messages: [],
  isLoading: false,
  error: null,
};

export const useSocialStore = create<SocialStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Group Actions
      createGroup: async (groupData: CreateGroupForm) => {
        try {
          set({ isLoading: true, error: null });
          const newGroup = await studyGroupService.createGroup(groupData);
          set(state => ({
            groups: [...state.groups, newGroup],
            activeGroup: newGroup,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create group',
            isLoading: false 
          });
          throw error;
        }
      },

      joinGroup: async (joinData: JoinGroupForm) => {
        try {
          set({ isLoading: true, error: null });
          const group = await studyGroupService.joinGroup(joinData);
          set(state => ({
            groups: [...state.groups, group],
            activeGroup: group,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to join group',
            isLoading: false 
          });
          throw error;
        }
      },

      leaveGroup: async (groupId: string) => {
        try {
          set({ isLoading: true, error: null });
          await studyGroupService.leaveGroup(groupId);
          set(state => ({
            groups: state.groups.filter(g => g.id !== groupId),
            activeGroup: state.activeGroup?.id === groupId ? null : state.activeGroup,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to leave group',
            isLoading: false 
          });
          throw error;
        }
      },

      updateGroup: async (groupId: string, updates: Partial<CreateGroupForm>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedGroup = await studyGroupService.updateGroup(groupId, updates);
          set(state => ({
            groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
            activeGroup: state.activeGroup?.id === groupId ? updatedGroup : state.activeGroup,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update group',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchMyGroups: async () => {
        try {
          set({ isLoading: true, error: null });
          const groups = await studyGroupService.getMyGroups();
          set({ groups, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch groups',
            isLoading: false 
          });
        }
      },

      fetchGroupById: async (groupId: string) => {
        try {
          set({ isLoading: true, error: null });
          const group = await studyGroupService.getGroupById(groupId);
          set(state => ({
            groups: state.groups.some(g => g.id === groupId) 
              ? state.groups.map(g => g.id === groupId ? group : g)
              : [...state.groups, group],
            activeGroup: group,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch group',
            isLoading: false 
          });
        }
      },

      setActiveGroup: (group: StudyGroup | null) => {
        set({ activeGroup: group });
      },

      searchGroups: async (filters: GroupFilters) => {
        try {
          set({ isLoading: true, error: null });
          const groups = await studyGroupService.searchGroups(filters);
          set({ isLoading: false });
          return groups;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search groups',
            isLoading: false 
          });
          return [];
        }
      },

      // Member Actions
      inviteToGroup: async (inviteData: GroupInviteForm) => {
        try {
          set({ isLoading: true, error: null });
          const invitation = await studyGroupService.inviteToGroup(inviteData);
          set(state => ({
            invitations: [...state.invitations, invitation],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send invitation',
            isLoading: false 
          });
          throw error;
        }
      },

      respondToInvitation: async (invitationId: string, accept: boolean) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement invitation response
          set(state => ({
            invitations: state.invitations.map(inv => 
              inv.id === invitationId 
                ? { ...inv, status: accept ? 'accepted' : 'declined', respondedAt: new Date() }
                : inv
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to respond to invitation',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchGroupInvitations: async () => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement fetch invitations
          set({ invitations: [], isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch invitations',
            isLoading: false 
          });
        }
      },

      // Challenge Actions
      createChallenge: async (challengeData: CreateChallengeForm) => {
        try {
          set({ isLoading: true, error: null });
          const challenge = await studyGroupService.createChallenge(challengeData);
          set(state => ({
            challenges: [...state.challenges, challenge],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create challenge',
            isLoading: false 
          });
          throw error;
        }
      },

      joinChallenge: async (challengeId: string) => {
        try {
          set({ isLoading: true, error: null });
          await studyGroupService.joinChallenge(challengeId);
          // TODO: Update challenge participants
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to join challenge',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchGroupChallenges: async (groupId: string, filters?: ChallengeFilters) => {
        try {
          set({ isLoading: true, error: null });
          const challenges = await studyGroupService.getGroupChallenges(groupId, filters);
          set({ challenges, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch challenges',
            isLoading: false 
          });
        }
      },

      // Study Room Actions
      createStudyRoom: async (roomData: StudyRoomForm) => {
        try {
          set({ isLoading: true, error: null });
          const room = await studyGroupService.createStudyRoom(roomData);
          set(state => ({
            studyRooms: [...state.studyRooms, room],
            activeStudyRoom: room,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create study room',
            isLoading: false 
          });
          throw error;
        }
      },

      joinStudyRoom: async (roomId: string) => {
        try {
          set({ isLoading: true, error: null });
          await studyGroupService.joinStudyRoom(roomId);
          // TODO: Update room participants
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to join study room',
            isLoading: false 
          });
          throw error;
        }
      },

      leaveStudyRoom: async (roomId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement leave study room
          set(state => ({
            activeStudyRoom: state.activeStudyRoom?.id === roomId ? null : state.activeStudyRoom,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to leave study room',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchStudyRooms: async (groupId: string) => {
        try {
          set({ isLoading: true, error: null });
          const studyRooms = await studyGroupService.getGroupStudyRooms(groupId);
          set({ studyRooms, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch study rooms',
            isLoading: false 
          });
        }
      },

      setActiveStudyRoom: (room: StudyRoom | null) => {
        set({ activeStudyRoom: room });
      },

      // Leaderboard Actions
      fetchLeaderboard: async (groupId: string, type: LeaderboardType, period: LeaderboardPeriod) => {
        try {
          set({ isLoading: true, error: null });
          const leaderboard = await studyGroupService.getGroupLeaderboard(groupId, type, period);
          set(state => ({
            leaderboards: state.leaderboards.filter(l => 
              !(l.groupId === groupId && l.type === type && l.period === period)
            ).concat(leaderboard),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
            isLoading: false 
          });
        }
      },

      // Activity Actions
      fetchGroupActivities: async (groupId: string) => {
        try {
          set({ isLoading: true, error: null });
          const activities = await studyGroupService.getGroupActivities(groupId);
          set({ activities, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch activities',
            isLoading: false 
          });
        }
      },

      // Message Actions
      fetchGroupMessages: async (groupId: string) => {
        try {
          set({ isLoading: true, error: null });
          const messages = await studyGroupService.getGroupMessages(groupId);
          set({ messages, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch messages',
            isLoading: false 
          });
        }
      },

      sendMessage: async (groupId: string, content: string, type: MessageType = 'text') => {
        try {
          const message = await studyGroupService.sendGroupMessage(groupId, content, type);
          set(state => ({
            messages: [...state.messages, message]
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message'
          });
          throw error;
        }
      },

      // Utility Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'social-store',
    }
  )
);