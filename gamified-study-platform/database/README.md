# Database Documentation

This directory contains all database-related files for the Gamified Study Platform.

## Directory Structure

```
database/
├── migrations/           # Database schema migrations
│   ├── 001_initial_schema.sql
│   └── 002_rls_policies.sql
├── functions/           # Database functions
│   └── xp_and_leveling.sql
├── seeds/              # Seed data
│   ├── 001_pet_species.sql
│   └── 002_achievements.sql
├── supabase-setup.md   # Setup instructions
└── README.md          # This file
```

## Database Schema Overview

### Core Tables

1. **user_profiles** - Extended user information beyond Supabase auth
2. **game_stats** - User's XP, level, streaks, and gamification data
3. **pet_species** - Available pet types and their evolution stages
4. **study_pets** - User's virtual pet companions
5. **courses** - User's courses and syllabi
6. **course_progress** - Progress tracking for each course
7. **quests** - Generated and custom study quests
8. **todo_items** - User's task management
9. **study_sessions** - Time tracking and analytics
10. **achievement_definitions** - Available achievements
11. **user_achievements** - Unlocked achievements per user
12. **study_groups** - Social study groups
13. **group_memberships** - User participation in groups

### Key Features

- **Row Level Security (RLS)** - All tables have proper security policies
- **Database Functions** - XP calculations, level progression, achievement checking
- **Triggers** - Automatic timestamp updates
- **Indexes** - Optimized for common queries
- **Constraints** - Data integrity and validation

## Database Functions

### XP and Leveling Functions

- `calculate_xp_for_level(level)` - XP required for a specific level
- `calculate_level_from_xp(total_xp)` - Current level based on total XP
- `award_xp(user_id, amount, source)` - Award XP and handle level ups
- `calculate_xp_reward(type, difficulty, duration, multiplier)` - Calculate XP rewards
- `update_streak(user_id)` - Update daily streaks and award bonuses
- `check_and_award_achievements(user_id)` - Check and unlock achievements

### Usage Examples

```sql
-- Award XP for a study session
SELECT * FROM award_xp('user-uuid', 50, 'study_session');

-- Calculate XP reward for a medium difficulty quest
SELECT calculate_xp_reward('quest_completion', 'medium', 60, 1.0);

-- Check for new achievements
SELECT * FROM check_and_award_achievements('user-uuid');
```

## Security

### Row Level Security Policies

All tables implement RLS to ensure:
- Users can only access their own data
- Group data is only accessible to group members
- Reference tables (pet_species, achievements) are publicly readable
- Proper authorization for all operations

### Data Protection

- User data is isolated by user ID
- Group data requires membership verification
- Sensitive operations require authentication
- Input validation through database constraints

## Performance Optimizations

### Indexes

- User-based queries (user_id columns)
- Time-based queries (created_at, started_at)
- Status-based queries (quest status, completion flags)
- Relationship queries (foreign keys)

### Query Optimization

- Efficient joins with proper indexing
- Selective data fetching
- Optimized aggregation queries
- Cached calculations where appropriate

## Maintenance

### Regular Tasks

1. **Monitor Performance** - Check slow queries and optimize
2. **Update Statistics** - Ensure query planner has current data
3. **Backup Verification** - Test backup and restore procedures
4. **Security Audit** - Review RLS policies and access patterns

### Scaling Considerations

- Connection pooling for high concurrency
- Read replicas for analytics queries
- Partitioning for large historical data
- Archiving old session data

## Development Workflow

### Making Schema Changes

1. Create new migration file with incremental number
2. Test migration on development database
3. Update TypeScript types if needed
4. Update service layer functions
5. Test all affected functionality

### Adding New Features

1. Design database schema changes
2. Create migration files
3. Update RLS policies if needed
4. Add database functions if required
5. Update seed data if applicable
6. Update TypeScript types and services

## Troubleshooting

### Common Issues

1. **RLS Policy Errors** - Check user authentication and policy conditions
2. **Function Errors** - Verify parameter types and return values
3. **Migration Failures** - Check for syntax errors and dependencies
4. **Performance Issues** - Analyze query plans and add indexes

### Debugging Tools

- Supabase Dashboard SQL Editor
- Query performance analyzer
- RLS policy tester
- Database logs and metrics

## Best Practices

### Schema Design

- Use appropriate data types
- Add proper constraints
- Design for scalability
- Normalize appropriately

### Security

- Always use RLS policies
- Validate input data
- Use parameterized queries
- Audit access patterns

### Performance

- Index frequently queried columns
- Avoid N+1 query problems
- Use appropriate join types
- Monitor query performance

This database design provides a solid foundation for the gamified study platform with proper security, performance, and scalability considerations.