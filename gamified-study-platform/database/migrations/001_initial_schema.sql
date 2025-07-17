-- Initial database schema for Gamified Study Platform
-- This migration creates all core tables with proper relationships and constraints

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game statistics table
CREATE TABLE public.game_stats (
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weekly_stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet species reference table
CREATE TABLE public.pet_species (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_happiness INTEGER DEFAULT 50 CHECK (base_happiness >= 0 AND base_happiness <= 100),
    base_health INTEGER DEFAULT 50 CHECK (base_health >= 0 AND base_health <= 100),
    evolution_stages JSONB NOT NULL DEFAULT '[]',
    sprite_urls JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study pets table
CREATE TABLE public.study_pets (
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    species_id UUID REFERENCES public.pet_species(id) NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
    health INTEGER DEFAULT 50 CHECK (health >= 0 AND health <= 100),
    evolution_stage VARCHAR(20) DEFAULT 'egg',
    accessories JSONB DEFAULT '[]',
    last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    syllabus JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course progress tracking
CREATE TABLE public.course_progress (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE PRIMARY KEY,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    total_time_spent INTEGER DEFAULT 0 CHECK (total_time_spent >= 0), -- in minutes
    last_studied TIMESTAMP WITH TIME ZONE,
    topics_completed JSONB DEFAULT '[]',
    performance_score DECIMAL(5,2) DEFAULT 0.00 CHECK (performance_score >= 0 AND performance_score <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest types enum
CREATE TYPE quest_type AS ENUM ('daily', 'weekly', 'milestone', 'bonus');
CREATE TYPE quest_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE quest_status AS ENUM ('available', 'active', 'completed', 'expired');

-- Quests table
CREATE TABLE public.quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type quest_type NOT NULL,
    difficulty quest_difficulty DEFAULT 'medium',
    xp_reward INTEGER DEFAULT 25 CHECK (xp_reward >= 0),
    requirements JSONB DEFAULT '[]',
    status quest_status DEFAULT 'available',
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo items table
CREATE TABLE public.todo_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    estimated_time INTEGER, -- in minutes
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    todo_id UUID REFERENCES public.todo_items(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    session_type VARCHAR(20) DEFAULT 'pomodoro',
    focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement categories enum
CREATE TYPE achievement_category AS ENUM ('study_milestone', 'consistency', 'subject_mastery', 'social', 'pet_care', 'special_event');

-- Achievements reference table
CREATE TABLE public.achievement_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category achievement_category NOT NULL,
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 50 CHECK (xp_reward >= 0),
    unlock_conditions JSONB NOT NULL DEFAULT '{}',
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    is_hidden BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievement_definitions(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

-- Study groups table
CREATE TABLE public.study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    max_members INTEGER DEFAULT 10 CHECK (max_members > 0),
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships table
CREATE TABLE public.group_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'member', -- member, moderator, admin
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Indexes for better performance
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_courses_user_id ON public.courses(user_id);
CREATE INDEX idx_quests_user_id ON public.quests(user_id);
CREATE INDEX idx_quests_status ON public.quests(status);
CREATE INDEX idx_quests_type ON public.quests(type);
CREATE INDEX idx_todo_items_user_id ON public.todo_items(user_id);
CREATE INDEX idx_todo_items_completed ON public.todo_items(completed);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_started_at ON public.study_sessions(started_at);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_group_memberships_user_id ON public.group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_id ON public.group_memberships(group_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_stats_updated_at BEFORE UPDATE ON public.game_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_pets_updated_at BEFORE UPDATE ON public.study_pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON public.course_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todo_items_updated_at BEFORE UPDATE ON public.todo_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();