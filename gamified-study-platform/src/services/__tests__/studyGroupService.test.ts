import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { studyGroupService } from '../studyGroupService';
import { supabase } from '../../lib/supabase';
import type { CreateGroupForm, JoinGroupForm } from '../../types';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

// Mock UUID generation
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234'
}));

describe('StudyGroupService', () => {
  const mockUser = {
    data: {
      user: {
        id: 'user-123',
        email: 'test@example.com'
      }
    }
  };

  const mockGroup = {
    id: 'group-123',
    name: 'Test Study Group',
    description: 'A test group',
    invite_code: 'ABC123',
    max_members: 10,
    is_private: false,
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getUser as Mock).mockResolvedValue(mockUser);
  });

  describe('createGroup', () => {
    it('should create a new study group successfully', async () => {
      const groupData: CreateGroupForm = {
        name: 'Test Study Group',
        description: 'A test group',
        isPrivate: false,
        maxMembers: 10
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockGroup,
            error: null
          })
        })
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert
      });

      (supabase.from as Mock).mockReturnValue({
        insert: mockInsert
      });

      // Mock the addMemberToGroup method
      const addMemberSpy = vi.spyOn(studyGroupService as any, 'addMemberToGroup')
        .mockResolvedValue(undefined);

      const result = await studyGroupService.createGroup(groupData);

      expect(supabase.from).toHaveBeenCalledWith('study_groups');
      expect(mockInsert).toHaveBeenCalledWith({
        name: groupData.name,
        description: groupData.description,
        invite_code: expect.any(String),
        max_members: groupData.maxMembers,
        is_private: groupData.isPrivate,
        created_by: mockUser.data.user.id
      });
      expect(addMemberSpy).toHaveBeenCalledWith(mockGroup.id, mockUser.data.user.id, 'owner');
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user: null } });

      const groupData: CreateGroupForm = {
        name: 'Test Study Group',
        description: 'A test group',
        isPrivate: false,
        maxMembers: 10
      };

      await expect(studyGroupService.createGroup(groupData)).rejects.toThrow('User not authenticated');
    });
  });

  describe('joinGroup', () => {
    it('should join a group with valid invite code', async () => {
      const joinData: JoinGroupForm = {
        inviteCode: 'ABC123'
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockGroup,
            error: null
          })
        })
      });

      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });

      // Mock existing membership check
      const mockExistingCheck = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });

      // Mock member count check
      const getMemberCountSpy = vi.spyOn(studyGroupService as any, 'getGroupMemberCount')
        .mockResolvedValue(5);

      const addMemberSpy = vi.spyOn(studyGroupService as any, 'addMemberToGroup')
        .mockResolvedValue(undefined);

      const logActivitySpy = vi.spyOn(studyGroupService as any, 'logGroupActivity')
        .mockResolvedValue(undefined);

      const getGroupByIdSpy = vi.spyOn(studyGroupService, 'getGroupById')
        .mockResolvedValue({
          ...mockGroup,
          members: [],
          stats: {
            totalMembers: 1,
            activeMembers: 1,
            totalStudyHours: 0,
            totalQuestsCompleted: 0,
            averageLevel: 1,
            groupXP: 0,
            weeklyProgress: {
              totalXP: 0,
              totalStudyTime: 0,
              totalQuestsCompleted: 0,
              activeMembers: 1,
              groupChallengesCompleted: 0
            },
            achievements: []
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
              studySessionStarted: false
            }
          },
          createdAt: new Date(mockGroup.created_at),
          updatedAt: new Date(mockGroup.updated_at)
        } as any);

      const result = await studyGroupService.joinGroup(joinData);

      expect(supabase.from).toHaveBeenCalledWith('study_groups');
      expect(getMemberCountSpy).toHaveBeenCalledWith(mockGroup.id);
      expect(addMemberSpy).toHaveBeenCalledWith(mockGroup.id, mockUser.data.user.id, 'member');
      expect(logActivitySpy).toHaveBeenCalledWith(
        mockGroup.id, 
        mockUser.data.user.id, 
        'member_joined', 
        'joined the group'
      );
      expect(getGroupByIdSpy).toHaveBeenCalledWith(mockGroup.id);
    });

    it('should throw error for invalid invite code', async () => {
      const joinData: JoinGroupForm = {
        inviteCode: 'INVALID'
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows returned' }
          })
        })
      });

      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });

      await expect(studyGroupService.joinGroup(joinData)).rejects.toThrow('Invalid invite code');
    });

    it('should throw error when group is full', async () => {
      const joinData: JoinGroupForm = {
        inviteCode: 'ABC123'
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockGroup,
            error: null
          })
        })
      });

      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });

      const getMemberCountSpy = vi.spyOn(studyGroupService as any, 'getGroupMemberCount')
        .mockResolvedValue(10); // Group is full

      await expect(studyGroupService.joinGroup(joinData)).rejects.toThrow('Group is full');
    });
  });

  describe('leaveGroup', () => {
    it('should leave a group successfully', async () => {
      const groupId = 'group-123';

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      });

      (supabase.from as Mock).mockReturnValue({
        delete: mockDelete
      });

      const logActivitySpy = vi.spyOn(studyGroupService as any, 'logGroupActivity')
        .mockResolvedValue(undefined);

      await studyGroupService.leaveGroup(groupId);

      expect(supabase.from).toHaveBeenCalledWith('group_memberships');
      expect(logActivitySpy).toHaveBeenCalledWith(
        groupId, 
        mockUser.data.user.id, 
        'member_left', 
        'left the group'
      );
    });
  });

  describe('getMyGroups', () => {
    it('should fetch user groups successfully', async () => {
      const mockMemberships = [
        {
          group_id: 'group-123',
          study_groups: mockGroup
        }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockMemberships,
          error: null
        })
      });

      (supabase.from as Mock).mockReturnValue({
        select: mockSelect
      });

      const getGroupMembersSpy = vi.spyOn(studyGroupService, 'getGroupMembers')
        .mockResolvedValue([]);

      const calculateGroupStatsSpy = vi.spyOn(studyGroupService as any, 'calculateGroupStats')
        .mockResolvedValue({
          totalMembers: 1,
          activeMembers: 1,
          totalStudyHours: 0,
          totalQuestsCompleted: 0,
          averageLevel: 1,
          groupXP: 0,
          weeklyProgress: {
            totalXP: 0,
            totalStudyTime: 0,
            totalQuestsCompleted: 0,
            activeMembers: 1,
            groupChallengesCompleted: 0
          },
          achievements: []
        });

      const result = await studyGroupService.getMyGroups();

      expect(supabase.from).toHaveBeenCalledWith('group_memberships');
      expect(getGroupMembersSpy).toHaveBeenCalledWith(mockGroup.id);
      expect(calculateGroupStatsSpy).toHaveBeenCalledWith(mockGroup.id);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockGroup.id);
    });
  });

  describe('generateInviteCode', () => {
    it('should generate a valid invite code', () => {
      const inviteCode = (studyGroupService as any).generateInviteCode();
      
      expect(inviteCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(inviteCode).toHaveLength(6);
    });
  });

  describe('isUserActive', () => {
    it('should return true for recent activity', () => {
      const recentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
      const isActive = (studyGroupService as any).isUserActive(recentDate);
      
      expect(isActive).toBe(true);
    });

    it('should return false for old activity', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
      const isActive = (studyGroupService as any).isUserActive(oldDate);
      
      expect(isActive).toBe(false);
    });

    it('should return false for no activity', () => {
      const isActive = (studyGroupService as any).isUserActive(undefined);
      
      expect(isActive).toBe(false);
    });
  });
});