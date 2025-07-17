-- Create study_recommendations table
CREATE TABLE IF NOT EXISTS study_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'study_schedule',
        'subject_focus', 
        'study_method',
        'break_optimization',
        'goal_adjustment',
        'resource_suggestion',
        'habit_formation',
        'performance_boost',
        'time_management',
        'motivation_enhancement'
    )),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    action_items JSONB NOT NULL DEFAULT '[]',
    estimated_impact VARCHAR(20) NOT NULL CHECK (estimated_impact IN ('high', 'medium', 'low')),
    time_to_implement VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('immediate', 'short_term', 'long_term', 'ongoing')),
    context JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_applied BOOLEAN NOT NULL DEFAULT false,
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_study_recommendations_user_id ON study_recommendations(user_id);
CREATE INDEX idx_study_recommendations_type ON study_recommendations(type);
CREATE INDEX idx_study_recommendations_priority ON study_recommendations(priority);
CREATE INDEX idx_study_recommendations_active ON study_recommendations(is_active);
CREATE INDEX idx_study_recommendations_created_at ON study_recommendations(created_at);
CREATE INDEX idx_study_recommendations_expires_at ON study_recommendations(expires_at);

-- Create composite indexes for common query patterns
CREATE INDEX idx_study_recommendations_user_active ON study_recommendations(user_id, is_active, is_dismissed);
CREATE INDEX idx_study_recommendations_user_priority ON study_recommendations(user_id, priority, created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE study_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own recommendations
CREATE POLICY "Users can view own recommendations" ON study_recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own recommendations (for system-generated ones)
CREATE POLICY "Users can insert own recommendations" ON study_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recommendations
CREATE POLICY "Users can update own recommendations" ON study_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own recommendations
CREATE POLICY "Users can delete own recommendations" ON study_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_study_recommendations_updated_at
    BEFORE UPDATE ON study_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically expire old recommendations
CREATE OR REPLACE FUNCTION expire_old_recommendations()
RETURNS void AS $$
BEGIN
    UPDATE study_recommendations 
    SET is_active = false
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ language 'plpgsql';

-- Create table for recommendation feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES study_recommendations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    was_helpful BOOLEAN,
    suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for recommendation feedback
CREATE INDEX idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_created_at ON recommendation_feedback(created_at);

-- Add RLS for recommendation feedback
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own feedback
CREATE POLICY "Users can view own feedback" ON recommendation_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON recommendation_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON recommendation_feedback
    FOR UPDATE USING (auth.uid() = user_id);

-- Create table for recommendation analytics
CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    total_generated INTEGER DEFAULT 0,
    total_applied INTEGER DEFAULT 0,
    total_dismissed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    success_rate DECIMAL(5,2),
    last_generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recommendation_type)
);

-- Create indexes for recommendation analytics
CREATE INDEX idx_recommendation_analytics_user_id ON recommendation_analytics(user_id);
CREATE INDEX idx_recommendation_analytics_type ON recommendation_analytics(recommendation_type);

-- Add RLS for recommendation analytics
ALTER TABLE recommendation_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own analytics
CREATE POLICY "Users can view own analytics" ON recommendation_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: System can insert/update analytics
CREATE POLICY "System can manage analytics" ON recommendation_analytics
    FOR ALL USING (true);

-- Create trigger to update analytics
CREATE TRIGGER update_recommendation_analytics_updated_at
    BEFORE UPDATE ON recommendation_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update recommendation analytics
CREATE OR REPLACE FUNCTION update_recommendation_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when recommendation status changes
    IF TG_OP = 'UPDATE' THEN
        -- Check if recommendation was applied
        IF OLD.is_applied = false AND NEW.is_applied = true THEN
            INSERT INTO recommendation_analytics (user_id, recommendation_type, total_applied)
            VALUES (NEW.user_id, NEW.type, 1)
            ON CONFLICT (user_id, recommendation_type)
            DO UPDATE SET 
                total_applied = recommendation_analytics.total_applied + 1,
                updated_at = NOW();
        END IF;
        
        -- Check if recommendation was dismissed
        IF OLD.is_dismissed = false AND NEW.is_dismissed = true THEN
            INSERT INTO recommendation_analytics (user_id, recommendation_type, total_dismissed)
            VALUES (NEW.user_id, NEW.type, 1)
            ON CONFLICT (user_id, recommendation_type)
            DO UPDATE SET 
                total_dismissed = recommendation_analytics.total_dismissed + 1,
                updated_at = NOW();
        END IF;
    END IF;
    
    -- Update analytics when new recommendation is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO recommendation_analytics (user_id, recommendation_type, total_generated, last_generated_at)
        VALUES (NEW.user_id, NEW.type, 1, NEW.created_at)
        ON CONFLICT (user_id, recommendation_type)
        DO UPDATE SET 
            total_generated = recommendation_analytics.total_generated + 1,
            last_generated_at = NEW.created_at,
            updated_at = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger to update analytics
CREATE TRIGGER update_recommendation_analytics_trigger
    AFTER INSERT OR UPDATE ON study_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_recommendation_analytics();

-- Create view for recommendation summary
CREATE OR REPLACE VIEW recommendation_summary AS
SELECT 
    user_id,
    COUNT(*) as total_recommendations,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE priority = 'high') as high_count,
    COUNT(*) FILTER (WHERE is_applied = true) as applied_count,
    COUNT(*) FILTER (WHERE is_dismissed = true) as dismissed_count,
    COUNT(*) FILTER (WHERE is_active = true AND is_dismissed = false) as active_count,
    AVG(CASE WHEN rf.rating IS NOT NULL THEN rf.rating END) as average_rating,
    MAX(created_at) as last_recommendation_at
FROM study_recommendations sr
LEFT JOIN recommendation_feedback rf ON sr.id = rf.recommendation_id
GROUP BY user_id;

-- Grant necessary permissions
GRANT SELECT ON recommendation_summary TO authenticated;

-- Create function to clean up expired recommendations (to be called by a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
    -- Mark expired recommendations as inactive
    UPDATE study_recommendations 
    SET is_active = false
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
    
    -- Delete very old dismissed recommendations (older than 6 months)
    DELETE FROM study_recommendations
    WHERE is_dismissed = true 
    AND dismissed_at < NOW() - INTERVAL '6 months';
    
    -- Delete old feedback (older than 1 year)
    DELETE FROM recommendation_feedback
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE study_recommendations IS 'Stores AI-generated study recommendations for users';
COMMENT ON TABLE recommendation_feedback IS 'Stores user feedback on recommendations';
COMMENT ON TABLE recommendation_analytics IS 'Tracks recommendation performance metrics';
COMMENT ON VIEW recommendation_summary IS 'Provides summary statistics for user recommendations';

COMMENT ON COLUMN study_recommendations.type IS 'Type of recommendation (study_schedule, subject_focus, etc.)';
COMMENT ON COLUMN study_recommendations.priority IS 'Priority level (critical, high, medium, low)';
COMMENT ON COLUMN study_recommendations.action_items IS 'JSON array of actionable items';
COMMENT ON COLUMN study_recommendations.context IS 'JSON object with recommendation context (course, performance, etc.)';
COMMENT ON COLUMN study_recommendations.metadata IS 'JSON object with algorithm metadata (confidence, version, etc.)';