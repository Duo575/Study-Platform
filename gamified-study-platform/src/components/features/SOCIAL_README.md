# Social Features Documentation

This directory contains all the components and functionality for the study groups and social features of the gamified study platform.

## Overview

The social features enable users to:
- Create and join study groups
- Participate in group challenges
- Use virtual study rooms for collaborative sessions
- Chat with group members
- View group leaderboards
- Track group activities

## Components

### Core Components

#### `StudyGroupsPage.tsx`
The main page component that displays all study groups functionality. Features:
- List of user's study groups
- Group search and discovery
- Group creation and joining
- Detailed group view with tabs for different features
- Integration with all social sub-components

#### `CreateGroupModal.tsx`
Modal component for creating new study groups. Features:
- Two-step form process
- Group name, description, and privacy settings
- Member limit configuration
- Settings preview and confirmation

#### `JoinGroupModal.tsx`
Modal component for joining existing study groups. Features:
- Join by invite code
- Group search functionality (placeholder)
- Invite code validation and formatting
- User-friendly error handling

### Communication Components

#### `GroupChat.tsx`
Real-time chat component for group communication. Features:
- Message grouping by sender
- Role-based user display (owner, admin, member)
- Message reactions support
- Typing indicators
- Emoji and file attachment support (UI ready)

### Competition Components

#### `GroupLeaderboard.tsx`
Displays group member rankings across different metrics. Features:
- Multiple leaderboard types (XP, study time, quests, streaks, contribution)
- Time period filtering (daily, weekly, monthly, all-time)
- Rank badges and change indicators
- User highlighting and statistics

#### `GroupChallenges.tsx`
Manages group challenges and competitions. Features:
- Challenge status filtering
- Progress tracking with animated progress bars
- Participant management
- Reward display
- Challenge creation (placeholder modal)

### Collaboration Components

#### `StudyRooms.tsx`
Virtual study rooms for collaborative study sessions. Features:
- Room creation and management
- Participant status tracking
- Study session controls
- Room settings display
- Active session statistics

## Data Flow

### State Management
The social features use Zustand for state management through `socialStore.ts`:

```typescript
// Key state properties
interface SocialState {
  groups: StudyGroup[];
  activeGroup: StudyGroup | null;
  challenges: GroupChallenge[];
  studyRooms: StudyRoom[];
  messages: GroupMessage[];
  leaderboards: GroupLeaderboard[];
  // ... other properties
}
```

### Service Layer
`studyGroupService.ts` handles all API interactions:
- Group CRUD operations
- Member management
- Challenge operations
- Study room management
- Message handling
- Leaderboard calculations

### Custom Hook
`useSocial.ts` provides a convenient interface to the social store:
```typescript
const {
  groups,
  activeGroup,
  createGroup,
  joinGroup,
  sendMessage,
  // ... other methods
} = useSocial();
```

## Database Schema

### Core Tables
- `study_groups` - Group information
- `group_memberships` - User-group relationships
- `group_messages` - Chat messages
- `group_challenges` - Group challenges
- `challenge_participants` - Challenge participation
- `study_rooms` - Virtual study rooms
- `study_room_participants` - Room participation
- `group_activities` - Activity logging
- `group_leaderboards` - Cached leaderboard data

### Security
All tables implement Row Level Security (RLS) policies to ensure:
- Users can only access groups they belong to
- Proper role-based permissions for admin actions
- Secure message and activity access

## Features Implementation Status

### ✅ Completed Features
- [x] Study group creation and management
- [x] Group joining via invite codes
- [x] Group member management
- [x] Real-time group chat
- [x] Group leaderboards with multiple metrics
- [x] Group activity tracking
- [x] Study room basic functionality
- [x] Challenge display and progress tracking
- [x] Comprehensive UI components
- [x] Database schema and migrations
- [x] Service layer implementation
- [x] State management with Zustand
- [x] Custom hooks for easy integration
- [x] Utility functions for social features
- [x] Comprehensive test coverage

### 🚧 Partially Implemented
- [ ] Challenge creation (UI placeholder exists)
- [ ] Study room creation (UI placeholder exists)
- [ ] Group search functionality (UI placeholder exists)
- [ ] Real-time message updates
- [ ] File and image sharing in chat
- [ ] Push notifications for group activities

### 📋 Future Enhancements
- [ ] Video/audio calls in study rooms
- [ ] Screen sharing capabilities
- [ ] Advanced challenge types
- [ ] Group analytics and insights
- [ ] Integration with calendar systems
- [ ] Mobile app support
- [ ] Advanced moderation tools

## Usage Examples

### Creating a Study Group
```typescript
const { createGroup } = useSocial();

const handleCreateGroup = async () => {
  await createGroup({
    name: "Advanced Mathematics",
    description: "Group for calculus and linear algebra study",
    isPrivate: false,
    maxMembers: 20
  });
};
```

### Joining a Group
```typescript
const { joinGroup } = useSocial();

const handleJoinGroup = async () => {
  await joinGroup({
    inviteCode: "ABC123"
  });
};
```

### Sending Messages
```typescript
const { sendMessage } = useSocial();

const handleSendMessage = async (groupId: string, content: string) => {
  await sendMessage(groupId, content, 'text');
};
```

## Testing

The social features include comprehensive test coverage:
- Unit tests for service layer functions
- Component testing for UI interactions
- Integration tests for data flow
- Mock implementations for external dependencies

Run tests with:
```bash
npm run test src/services/__tests__/studyGroupService.test.ts
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Components load data only when needed
2. **Caching**: Leaderboard data is cached to reduce database load
3. **Pagination**: Large lists are paginated for better performance
4. **Debouncing**: Search inputs are debounced to reduce API calls
5. **Memoization**: Expensive calculations are memoized

### Real-time Updates
- WebSocket connections for live chat
- Optimistic updates for better UX
- Conflict resolution for concurrent edits
- Automatic reconnection handling

## Security Considerations

### Data Protection
- All sensitive data is encrypted in transit and at rest
- User permissions are enforced at the database level
- Input validation prevents injection attacks
- Rate limiting prevents abuse

### Privacy Controls
- Private groups require invitation to join
- Message history is only accessible to group members
- User activity data is anonymized in analytics
- GDPR compliance for data deletion

## Troubleshooting

### Common Issues

1. **Groups not loading**
   - Check authentication status
   - Verify database permissions
   - Check network connectivity

2. **Messages not sending**
   - Verify group membership
   - Check message content validation
   - Ensure proper error handling

3. **Leaderboard not updating**
   - Check cache invalidation
   - Verify calculation logic
   - Ensure proper data synchronization

### Debug Tools
- Browser developer tools for client-side debugging
- Database query logs for server-side issues
- Network tab for API request monitoring
- Console logs for application flow tracking

## Contributing

When contributing to social features:

1. Follow the established component patterns
2. Add comprehensive tests for new functionality
3. Update this documentation for significant changes
4. Ensure accessibility compliance
5. Test across different screen sizes
6. Validate database migrations thoroughly

## API Reference

### Key Service Methods

#### Group Management
- `createGroup(data: CreateGroupForm): Promise<StudyGroup>`
- `joinGroup(data: JoinGroupForm): Promise<StudyGroup>`
- `leaveGroup(groupId: string): Promise<void>`
- `updateGroup(groupId: string, updates: Partial<CreateGroupForm>): Promise<StudyGroup>`

#### Communication
- `sendMessage(groupId: string, content: string, type?: MessageType): Promise<GroupMessage>`
- `fetchGroupMessages(groupId: string): Promise<GroupMessage[]>`

#### Competition
- `fetchLeaderboard(groupId: string, type: LeaderboardType, period: LeaderboardPeriod): Promise<void>`
- `createChallenge(data: CreateChallengeForm): Promise<GroupChallenge>`
- `joinChallenge(challengeId: string): Promise<void>`

#### Collaboration
- `createStudyRoom(data: StudyRoomForm): Promise<StudyRoom>`
- `joinStudyRoom(roomId: string): Promise<void>`
- `leaveStudyRoom(roomId: string): Promise<void>`

For detailed API documentation, refer to the service implementation files.