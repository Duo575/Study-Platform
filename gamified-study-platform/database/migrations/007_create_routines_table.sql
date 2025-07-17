-- Migration for Routine Board and Schedule Management
-- Creates tables for routines, schedules, and performance tracking

-- Routine templates table
CREATE TABLE public.routine_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'study', 'exercise', 'personal', 'work'
    template_data JSONB NOT NULL DEFAULT '{}', -- Contains schedule structure
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User routines table
CREATE TABLE public.routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    template_id UUID REFERENCES public.routine_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule slots table - represents time blocks in the weekly schedule
CREATE TABLE public.schedule_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'study', 'break', 'exercise', 'meal', 'custom'
    activity_name VARCHAR(200),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    is_flexible BOOLEAN DEFAULT FALSE, -- Can be moved if conflicts arise
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Routine performance tracking
CREATE TABLE public.routine_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_slots INTEGER NOT NULL DEFAULT 0,
    completed_slots INTEGER NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_slots = 0 THEN 0 
            ELSE (completed_slots::DECIMAL / total_slots::DECIMAL) * 100 
        END
    ) STORED,
    total_planned_minutes INTEGER DEFAULT 0,
    actual_minutes INTEGER DEFAULT 0,
    efficiency_score DECIMAL(5,2) DEFAULT 0.00 CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(routine_id, date)
);

-- Schedule slot completions - tracks individual slot completion
CREATE TABLE public.slot_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slot_id UUID REFERENCES public.schedule_slots(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    actual_duration INTEGER, -- in minutes
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slot_id, date)
);

-- Routine sharing table - for sharing routines with other users
CREATE TABLE public.routine_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    shared_with UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    share_code VARCHAR(10) UNIQUE, -- For public sharing
    is_public BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{"view": true, "copy": true, "modify": false}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(routine_id, shared_with) -- Prevent duplicate shares to same user
);

-- Routine optimization suggestions
CREATE TABLE public.routine_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL, -- 'time_optimization', 'conflict_resolution', 'productivity_boost'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    suggested_changes JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    is_applied BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_routines_user_id ON public.routines(user_id);
CREATE INDEX idx_routines_active ON public.routines(is_active);
CREATE INDEX idx_schedule_slots_routine_id ON public.schedule_slots(routine_id);
CREATE INDEX idx_schedule_slots_day_time ON public.schedule_slots(day_of_week, start_time);
CREATE INDEX idx_routine_performance_routine_date ON public.routine_performance(routine_id, date);
CREATE INDEX idx_slot_completions_slot_date ON public.slot_completions(slot_id, date);
CREATE INDEX idx_routine_shares_shared_by ON public.routine_shares(shared_by);
CREATE INDEX idx_routine_shares_shared_with ON public.routine_shares(shared_with);
CREATE INDEX idx_routine_suggestions_user_id ON public.routine_suggestions(user_id);
CREATE INDEX idx_routine_templates_public ON public.routine_templates(is_public);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_routine_templates_updated_at BEFORE UPDATE ON public.routine_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_slots_updated_at BEFORE UPDATE ON public.schedule_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routine_performance_updated_at BEFORE UPDATE ON public.routine_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to detect schedule conflicts
CREATE OR REPLACE FUNCTION detect_schedule_conflicts(
    p_routine_id UUID,
    p_day_of_week INTEGER,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_slot_id UUID DEFAULT NULL
)
RETURNS TABLE(
    conflicting_slot_id UUID,
    activity_name VARCHAR(200),
    start_time TIME,
    end_time TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.id,
        ss.activity_name,
        ss.start_time,
        ss.end_time
    FROM public.schedule_slots ss
    WHERE ss.routine_id = p_routine_id
        AND ss.day_of_week = p_day_of_week
        AND (p_exclude_slot_id IS NULL OR ss.id != p_exclude_slot_id)
        AND (
            (p_start_time >= ss.start_time AND p_start_time < ss.end_time) OR
            (p_end_time > ss.start_time AND p_end_time <= ss.end_time) OR
            (p_start_time <= ss.start_time AND p_end_time >= ss.end_time)
        );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate routine consistency score
CREATE OR REPLACE FUNCTION calculate_routine_consistency(
    p_routine_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_days INTEGER;
    consistent_days INTEGER;
    consistency_score DECIMAL(5,2);
BEGIN
    -- Count total days in the period
    total_days := p_days_back;
    
    -- Count days where completion rate was >= 80%
    SELECT COUNT(*)
    INTO consistent_days
    FROM public.routine_performance rp
    WHERE rp.routine_id = p_routine_id
        AND rp.date >= CURRENT_DATE - INTERVAL '1 day' * p_days_back
        AND rp.completion_rate >= 80.0;
    
    -- Calculate consistency score
    IF total_days = 0 THEN
        consistency_score := 0.0;
    ELSE
        consistency_score := (consistent_days::DECIMAL / total_days::DECIMAL) * 100.0;
    END IF;
    
    RETURN consistency_score;
END;
$$ LANGUAGE plpgsql;

-- Function to generate routine optimization suggestions
CREATE OR REPLACE FUNCTION generate_routine_suggestions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    routine_record RECORD;
    avg_completion DECIMAL(5,2);
    suggestion_count INTEGER;
BEGIN
    -- Clear old suggestions (older than 7 days)
    DELETE FROM public.routine_suggestions 
    WHERE user_id = p_user_id 
        AND created_at < NOW() - INTERVAL '7 days'
        AND is_applied = FALSE 
        AND is_dismissed = FALSE;
    
    -- Loop through user's active routines
    FOR routine_record IN 
        SELECT r.id, r.name
        FROM public.routines r
        WHERE r.user_id = p_user_id AND r.is_active = TRUE
    LOOP
        -- Calculate average completion rate for last 14 days
        SELECT AVG(completion_rate)
        INTO avg_completion
        FROM public.routine_performance rp
        WHERE rp.routine_id = routine_record.id
            AND rp.date >= CURRENT_DATE - INTERVAL '14 days';
        
        -- Count existing suggestions for this routine
        SELECT COUNT(*)
        INTO suggestion_count
        FROM public.routine_suggestions rs
        WHERE rs.routine_id = routine_record.id
            AND rs.is_applied = FALSE
            AND rs.is_dismissed = FALSE;
        
        -- Generate suggestions based on performance
        IF avg_completion IS NOT NULL AND avg_completion < 70.0 AND suggestion_count = 0 THEN
            INSERT INTO public.routine_suggestions (
                user_id, routine_id, suggestion_type, title, description, priority
            ) VALUES (
                p_user_id,
                routine_record.id,
                'productivity_boost',
                'Improve ' || routine_record.name || ' consistency',
                'Your completion rate for this routine is ' || ROUND(avg_completion, 1) || '%. Consider reducing the number of activities or adjusting time slots to make it more achievable.',
                2
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;