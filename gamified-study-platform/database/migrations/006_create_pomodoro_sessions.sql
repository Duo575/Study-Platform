-- Create pomodoro_sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    todo_item_id UUID REFERENCES todo_items(id) ON DELETE SET NULL,
    quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER NOT NULL, -- in minutes
    type VARCHAR(20) NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    interrupted BOOLEAN NOT NULL DEFAULT FALSE,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    session_number INTEGER NOT NULL DEFAULT 1,
    cycle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_start_time ON pomodoro_sessions(start_time);
CREATE INDEX idx_pomodoro_sessions_type ON pomodoro_sessions(type);
CREATE INDEX idx_pomodoro_sessions_completed ON pomodoro_sessions(completed);
CREATE INDEX idx_pomodoro_sessions_course_id ON pomodoro_sessions(course_id);
CREATE INDEX idx_pomodoro_sessions_cycle_id ON pomodoro_sessions(cycle_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pomodoro_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pomodoro_sessions_updated_at
    BEFORE UPDATE ON pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_pomodoro_sessions_updated_at();

-- Enable Row Level Security
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pomodoro sessions" ON pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions" ON pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions" ON pomodoro_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions" ON pomodoro_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for analytics queries
CREATE OR REPLACE VIEW pomodoro_analytics AS
SELECT 
    user_id,
    DATE(start_time) as session_date,
    EXTRACT(HOUR FROM start_time) as session_hour,
    type,
    COUNT(*) as session_count,
    COUNT(*) FILTER (WHERE completed = true) as completed_count,
    SUM(duration) FILTER (WHERE completed = true AND type = 'work') as total_focus_time,
    SUM(xp_earned) as total_xp,
    course_id,
    AVG(duration) FILTER (WHERE completed = true) as avg_duration
FROM pomodoro_sessions
GROUP BY user_id, DATE(start_time), EXTRACT(HOUR FROM start_time), type, course_id;

-- Grant access to the view
GRANT SELECT ON pomodoro_analytics TO authenticated;

-- Create RLS policy for the view
ALTER VIEW pomodoro_analytics OWNER TO postgres;
CREATE POLICY "Users can view their own analytics" ON pomodoro_analytics
    FOR SELECT USING (auth.uid() = user_id);