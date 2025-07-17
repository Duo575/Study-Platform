-- Row Level Security (RLS) Policies for Gamified Study Platform
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Pet species and achievement definitions are public read-only
ALTER TABLE public.pet_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Game Stats Policies
CREATE POLICY "Users can view own game stats" ON public.game_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own game stats" ON public.game_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game stats" ON public.game_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study Pets Policies
CREATE POLICY "Users can view own pet" ON public.study_pets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pet" ON public.study_pets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pet" ON public.study_pets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Courses Policies
CREATE POLICY "Users can view own courses" ON public.courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" ON public.courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON public.courses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON public.courses
    FOR DELETE USING (auth.uid() = user_id);

-- Course Progress Policies
CREATE POLICY "Users can view own course progress" ON public.course_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_progress.course_id 
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own course progress" ON public.course_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_progress.course_id 
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own course progress" ON public.course_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_progress.course_id 
            AND courses.user_id = auth.uid()
        )
    );

-- Quests Policies
CREATE POLICY "Users can view own quests" ON public.quests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON public.quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON public.quests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests" ON public.quests
    FOR DELETE USING (auth.uid() = user_id);

-- Todo Items Policies
CREATE POLICY "Users can view own todos" ON public.todo_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todo_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todo_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todo_items
    FOR DELETE USING (auth.uid() = user_id);

-- Study Sessions Policies
CREATE POLICY "Users can view own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- User Achievements Policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study Groups Policies
CREATE POLICY "Users can view groups they belong to" ON public.study_groups
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.group_memberships 
            WHERE group_memberships.group_id = study_groups.id 
            AND group_memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.study_groups
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" ON public.study_groups
    FOR DELETE USING (auth.uid() = created_by);

-- Group Memberships Policies
CREATE POLICY "Users can view memberships of their groups" ON public.group_memberships
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.study_groups 
            WHERE study_groups.id = group_memberships.group_id 
            AND study_groups.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can join groups" ON public.group_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.group_memberships
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.study_groups 
            WHERE study_groups.id = group_memberships.group_id 
            AND study_groups.created_by = auth.uid()
        )
    );

-- Public read access for reference tables
CREATE POLICY "Anyone can view pet species" ON public.pet_species
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view achievement definitions" ON public.achievement_definitions
    FOR SELECT USING (true);

-- Additional security: Prevent users from accessing other users' data through group memberships
CREATE POLICY "Users can only see group members of groups they belong to" ON public.group_memberships
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.group_memberships gm2
            WHERE gm2.group_id = group_memberships.group_id 
            AND gm2.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.study_groups 
            WHERE study_groups.id = group_memberships.group_id 
            AND study_groups.created_by = auth.uid()
        )
    );