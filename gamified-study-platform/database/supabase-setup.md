# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the Gamified Study Platform.

## Prerequisites

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Install the Supabase CLI (optional but recommended)

## Step 1: Create a New Supabase Project

1. Go to your Supabase dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `gamified-study-platform`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in your Supabase project settings under "API".

## Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Run the migration files in order:

   **Step 3.1: Initial Schema**
   - Copy and paste the contents of `database/migrations/001_initial_schema.sql`
   - Click "Run" to execute

   **Step 3.2: RLS Policies**
   - Copy and paste the contents of `database/migrations/002_rls_policies.sql`
   - Click "Run" to execute

   **Step 3.3: Database Functions**
   - Copy and paste the contents of `database/functions/xp_and_leveling.sql`
   - Click "Run" to execute

   **Step 3.4: Seed Data - Pet Species**
   - Copy and paste the contents of `database/seeds/001_pet_species.sql`
   - Click "Run" to execute

   **Step 3.5: Seed Data - Achievements**
   - Copy and paste the contents of `database/seeds/002_achievements.sql`
   - Click "Run" to execute

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your_project_ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## Step 4: Verify Database Setup

1. Go to your Supabase dashboard
2. Navigate to "Table Editor"
3. Verify that all tables are created:
   - `user_profiles`
   - `game_stats`
   - `pet_species`
   - `study_pets`
   - `courses`
   - `course_progress`
   - `quests`
   - `todo_items`
   - `study_sessions`
   - `achievement_definitions`
   - `user_achievements`
   - `study_groups`
   - `group_memberships`

4. Check that seed data is populated:
   - `pet_species` should have 5 species (Dragon, Phoenix, Owl, Cat, Robot)
   - `achievement_definitions` should have multiple achievements

## Step 5: Configure Authentication

1. Go to "Authentication" > "Settings" in your Supabase dashboard
2. Configure the following settings:

   **Site URL**: `http://localhost:5173` (for development)
   
   **Redirect URLs**: Add your production URL when deploying

   **Email Templates**: Customize if needed

   **Providers**: Enable email/password authentication (enabled by default)

## Step 6: Test Database Functions

You can test the database functions in the SQL Editor:

```sql
-- Test XP calculation
SELECT calculate_xp_for_level(5);
SELECT calculate_level_from_xp(1000);

-- Test XP reward calculation
SELECT calculate_xp_reward('study_session', 'medium', 60, 1.0);

-- Test with a user (replace with actual user ID after registration)
-- SELECT * FROM award_xp('user-uuid-here', 100, 'test');
```

## Step 7: Security Verification

1. Go to "Authentication" > "Policies"
2. Verify that RLS is enabled on all tables
3. Check that policies are properly configured
4. Test that users can only access their own data

## Troubleshooting

### Common Issues:

1. **Migration Errors**: 
   - Make sure to run migrations in the correct order
   - Check for syntax errors in the SQL files

2. **RLS Policy Issues**:
   - Ensure `auth.uid()` is available in your policies
   - Test policies with actual user data

3. **Function Errors**:
   - Check that all required extensions are enabled
   - Verify function syntax and dependencies

4. **Seed Data Issues**:
   - Ensure JSONB data is properly formatted
   - Check for foreign key constraint violations

### Getting Help:

- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Join Supabase Discord community
- Review error logs in the Supabase dashboard

## Next Steps

After completing the database setup:

1. Test the authentication flow in your application
2. Verify that user registration creates proper profile and game stats
3. Test pet adoption and XP awarding functionality
4. Ensure all database operations work correctly with RLS policies

## Database Schema Overview

The database is designed with the following key relationships:

- **Users** have one profile, game stats, and study pet
- **Courses** belong to users and can have multiple quests
- **Quests** can be linked to courses and todo items
- **Study sessions** track time spent on courses/todos
- **Achievements** are unlocked based on user activities
- **Study groups** enable social features with memberships

All tables implement Row Level Security to ensure data privacy and security.