-- Database setup script for StudyQuest
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

-- Create game_stats table
CREATE TABLE IF NOT EXISTS public.game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  weekly_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  syllabus JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_progress table
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  topics_completed JSONB DEFAULT '{}',
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create pet_species table
CREATE TABLE IF NOT EXISTS public.pet_species (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  base_happiness INTEGER DEFAULT 50 CHECK (base_happiness >= 0 AND base_happiness <= 100),
  base_health INTEGER DEFAULT 50 CHECK (base_health >= 0 AND base_health <= 100),
  evolution_stages JSONB DEFAULT '[]',
  sprite_urls JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_pets table
CREATE TABLE IF NOT EXISTS public.study_pets (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  species_id UUID REFERENCES public.pet_species(id) NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  health INTEGER DEFAULT 50 CHECK (health >= 0 AND health <= 100),
  evolution_stage VARCHAR(20) DEFAULT 'baby',
  accessories JSONB DEFAULT '[]',
  last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
-- User profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Game stats: users can only see/edit their own stats
CREATE POLICY "Users can view own game stats" ON public.game_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own game stats" ON public.game_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game stats" ON public.game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Courses: users can only see/edit their own courses
CREATE POLICY "Users can view own courses" ON public.courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON public.courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON public.courses
  FOR DELETE USING (auth.uid() = user_id);

-- Course progress: users can only see/edit their own progress
CREATE POLICY "Users can view own course progress" ON public.course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" ON public.course_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress" ON public.course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pet species: everyone can read, no one can modify (managed by admin)
CREATE POLICY "Anyone can view pet species" ON public.pet_species
  FOR SELECT USING (true);

-- Study pets: users can only see/edit their own pet
CREATE POLICY "Users can view own pet" ON public.study_pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pet" ON public.study_pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pet" ON public.study_pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pet" ON public.study_pets
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_pets ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.game_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pet_species
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.study_pets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert pet species seed data
INSERT INTO public.pet_species (name, description, base_happiness, base_health, evolution_stages, sprite_urls) VALUES
(
    'Dragon',
    'A mystical dragon companion that grows stronger with your dedication to learning. Dragons are known for their wisdom and fierce loyalty to their study partners.',
    60,
    70,
    '[
        {
            "name": "Dragon Egg",
            "stage": "egg",
            "description": "A mysterious egg with ancient runes",
            "requirements": {"level": 1}
        },
        {
            "name": "Dragonling",
            "stage": "baby",
            "description": "A cute baby dragon with tiny wings",
            "requirements": {"level": 5}
        },
        {
            "name": "Young Dragon",
            "stage": "teen",
            "description": "A growing dragon learning to fly",
            "requirements": {"level": 15}
        },
        {
            "name": "Wise Dragon",
            "stage": "adult",
            "description": "A majestic dragon with powerful magic",
            "requirements": {"level": 30}
        },
        {
            "name": "Ancient Dragon",
            "stage": "master",
            "description": "A legendary dragon master of all knowledge",
            "requirements": {"level": 50}
        }
    ]'::jsonb,
    '{
        "egg": "🥚",
        "baby": "🐉",
        "teen": "🐲",
        "adult": "🐉",
        "master": "👑"
    }'::jsonb
),
(
    'Phoenix',
    'A magnificent phoenix that rises from the ashes of procrastination. Phoenix companions inspire resilience and help you bounce back from setbacks.',
    55,
    65,
    '[
        {
            "name": "Phoenix Egg",
            "stage": "egg",
            "description": "A warm, glowing egg with fiery patterns",
            "requirements": {"level": 1}
        },
        {
            "name": "Phoenix Chick",
            "stage": "baby",
            "description": "A small bird with flickering flames",
            "requirements": {"level": 4}
        },
        {
            "name": "Fire Phoenix",
            "stage": "teen",
            "description": "A beautiful bird with bright orange plumage",
            "requirements": {"level": 12}
        },
        {
            "name": "Blazing Phoenix",
            "stage": "adult",
            "description": "A stunning phoenix with magnificent fire wings",
            "requirements": {"level": 25}
        },
        {
            "name": "Eternal Phoenix",
            "stage": "master",
            "description": "An immortal phoenix radiating wisdom and power",
            "requirements": {"level": 45}
        }
    ]'::jsonb,
    '{
        "egg": "🥚",
        "baby": "🐣",
        "teen": "🦅",
        "adult": "🔥",
        "master": "✨"
    }'::jsonb
),
(
    'Owl',
    'A wise owl companion perfect for night study sessions. Owls are symbols of wisdom and help improve focus during late-night cramming.',
    50,
    60,
    '[
        {
            "name": "Owl Egg",
            "stage": "egg",
            "description": "A speckled egg hidden in a cozy nest",
            "requirements": {"level": 1}
        },
        {
            "name": "Owlet",
            "stage": "baby",
            "description": "A fluffy baby owl with big curious eyes",
            "requirements": {"level": 3}
        },
        {
            "name": "Young Owl",
            "stage": "teen",
            "description": "A growing owl learning to hunt for knowledge",
            "requirements": {"level": 10}
        },
        {
            "name": "Wise Owl",
            "stage": "adult",
            "description": "A majestic owl with piercing intelligent eyes",
            "requirements": {"level": 20}
        },
        {
            "name": "Scholar Owl",
            "stage": "master",
            "description": "An ancient owl keeper of all academic secrets",
            "requirements": {"level": 40}
        }
    ]'::jsonb,
    '{
        "egg": "🥚",
        "baby": "🦉",
        "teen": "🦉",
        "adult": "🦉",
        "master": "📚"
    }'::jsonb
),
(
    'Cat',
    'A curious cat companion that loves to sit on your books. Cats provide comfort during stressful study sessions and remind you to take breaks.',
    70,
    55,
    '[
        {
            "name": "Cat Egg",
            "stage": "egg",
            "description": "A soft, furry egg that purrs gently",
            "requirements": {"level": 1}
        },
        {
            "name": "Kitten",
            "stage": "baby",
            "description": "An adorable kitten that loves to play",
            "requirements": {"level": 2}
        },
        {
            "name": "Young Cat",
            "stage": "teen",
            "description": "A playful cat exploring the world of learning",
            "requirements": {"level": 8}
        },
        {
            "name": "Study Cat",
            "stage": "adult",
            "description": "A calm cat that enjoys quiet study sessions",
            "requirements": {"level": 18}
        },
        {
            "name": "Professor Cat",
            "stage": "master",
            "description": "A distinguished cat wearing tiny glasses",
            "requirements": {"level": 35}
        }
    ]'::jsonb,
    '{
        "egg": "🥚",
        "baby": "🐱",
        "teen": "🐈",
        "adult": "😸",
        "master": "🤓"
    }'::jsonb
),
(
    'Robot',
    'A high-tech robot companion for the digital age. Robots excel at organizing study schedules and providing systematic learning approaches.',
    45,
    80,
    '[
        {
            "name": "Robot Core",
            "stage": "egg",
            "description": "A glowing technological core waiting to activate",
            "requirements": {"level": 1}
        },
        {
            "name": "Basic Bot",
            "stage": "baby",
            "description": "A simple robot learning basic functions",
            "requirements": {"level": 6}
        },
        {
            "name": "Study Bot",
            "stage": "teen",
            "description": "An advanced robot with learning algorithms",
            "requirements": {"level": 16}
        },
        {
            "name": "AI Assistant",
            "stage": "adult",
            "description": "A sophisticated AI with vast knowledge",
            "requirements": {"level": 32}
        },
        {
            "name": "Quantum AI",
            "stage": "master",
            "description": "An ultimate AI companion with quantum processing",
            "requirements": {"level": 55}
        }
    ]'::jsonb,
    '{
        "egg": "⚙️",
        "baby": "🤖",
        "teen": "🤖",
        "adult": "🤖",
        "master": "🧠"
    }'::jsonb
)
ON CONFLICT (name) DO NOTHING;