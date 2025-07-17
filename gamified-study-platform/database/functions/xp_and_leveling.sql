-- Database functions for XP calculations and level progression
-- These functions handle the core gamification mechanics

-- Function to calculate XP required for a specific level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(target_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- XP formula: level^2 * 100 + (level-1) * 50
    -- This creates a progressive curve where higher levels require more XP
    IF target_level <= 1 THEN
        RETURN 0;
    END IF;
    
    RETURN (target_level - 1) * (target_level - 1) * 100 + (target_level - 2) * 50;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate current level based on total XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    level INTEGER := 1;
    required_xp INTEGER;
BEGIN
    -- Start from level 1 and increment until we find the right level
    WHILE true LOOP
        required_xp := calculate_xp_for_level(level + 1);
        IF total_xp < required_xp THEN
            EXIT;
        END IF;
        level := level + 1;
        
        -- Safety check to prevent infinite loops
        IF level > 1000 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate current XP within the current level
CREATE OR REPLACE FUNCTION calculate_current_level_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_level INTEGER;
    level_start_xp INTEGER;
BEGIN
    current_level := calculate_level_from_xp(total_xp);
    level_start_xp := calculate_xp_for_level(current_level);
    
    RETURN total_xp - level_start_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION calculate_xp_to_next_level(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_level INTEGER;
    next_level_xp INTEGER;
    current_level_xp INTEGER;
BEGIN
    current_level := calculate_level_from_xp(total_xp);
    next_level_xp := calculate_xp_for_level(current_level + 1);
    current_level_xp := calculate_current_level_xp(total_xp);
    
    RETURN (next_level_xp - calculate_xp_for_level(current_level)) - current_level_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award XP and update game stats
CREATE OR REPLACE FUNCTION award_xp(
    p_user_id UUID,
    p_xp_amount INTEGER,
    p_source TEXT DEFAULT 'unknown'
)
RETURNS TABLE(
    old_level INTEGER,
    new_level INTEGER,
    total_xp INTEGER,
    level_up BOOLEAN
) AS $$
DECLARE
    current_stats RECORD;
    new_total_xp INTEGER;
    new_level INTEGER;
    old_level INTEGER;
    level_up_occurred BOOLEAN := FALSE;
BEGIN
    -- Get current game stats
    SELECT * INTO current_stats 
    FROM public.game_stats 
    WHERE user_id = p_user_id;
    
    -- If no stats exist, create them
    IF NOT FOUND THEN
        INSERT INTO public.game_stats (user_id, level, total_xp, current_xp)
        VALUES (p_user_id, 1, 0, 0);
        
        SELECT * INTO current_stats 
        FROM public.game_stats 
        WHERE user_id = p_user_id;
    END IF;
    
    -- Calculate new values
    old_level := current_stats.level;
    new_total_xp := current_stats.total_xp + p_xp_amount;
    new_level := calculate_level_from_xp(new_total_xp);
    
    -- Check if level up occurred
    IF new_level > old_level THEN
        level_up_occurred := TRUE;
    END IF;
    
    -- Update game stats
    UPDATE public.game_stats 
    SET 
        total_xp = new_total_xp,
        level = new_level,
        current_xp = calculate_current_level_xp(new_total_xp),
        last_activity = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return results
    RETURN QUERY SELECT old_level, new_level, new_total_xp, level_up_occurred;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP reward based on activity type and parameters
CREATE OR REPLACE FUNCTION calculate_xp_reward(
    activity_type TEXT,
    difficulty TEXT DEFAULT 'medium',
    duration_minutes INTEGER DEFAULT 30,
    bonus_multiplier DECIMAL DEFAULT 1.0
)
RETURNS INTEGER AS $$
DECLARE
    base_xp INTEGER;
    difficulty_multiplier DECIMAL;
    time_multiplier DECIMAL;
    final_xp INTEGER;
BEGIN
    -- Base XP values for different activities
    CASE activity_type
        WHEN 'study_session' THEN base_xp := 10;
        WHEN 'quest_completion' THEN base_xp := 25;
        WHEN 'todo_completion' THEN base_xp := 15;
        WHEN 'achievement_unlock' THEN base_xp := 50;
        WHEN 'streak_bonus' THEN base_xp := 20;
        WHEN 'pet_interaction' THEN base_xp := 5;
        WHEN 'group_activity' THEN base_xp := 30;
        ELSE base_xp := 10;
    END CASE;
    
    -- Difficulty multipliers
    CASE difficulty
        WHEN 'easy' THEN difficulty_multiplier := 1.0;
        WHEN 'medium' THEN difficulty_multiplier := 1.5;
        WHEN 'hard' THEN difficulty_multiplier := 2.0;
        ELSE difficulty_multiplier := 1.0;
    END CASE;
    
    -- Time-based multiplier (every 30 minutes = 1x multiplier)
    time_multiplier := GREATEST(duration_minutes::DECIMAL / 30.0, 0.1);
    
    -- Calculate final XP
    final_xp := FLOOR(base_xp * difficulty_multiplier * time_multiplier * bonus_multiplier);
    
    -- Ensure minimum XP of 1
    RETURN GREATEST(final_xp, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update streak and award streak bonuses
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS TABLE(
    streak_days INTEGER,
    bonus_awarded BOOLEAN,
    bonus_xp INTEGER
) AS $$
DECLARE
    current_stats RECORD;
    last_activity_date DATE;
    today_date DATE := CURRENT_DATE;
    new_streak INTEGER;
    bonus_xp_amount INTEGER := 0;
    bonus_given BOOLEAN := FALSE;
BEGIN
    -- Get current game stats
    SELECT * INTO current_stats 
    FROM public.game_stats 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- Create initial stats if they don't exist
        INSERT INTO public.game_stats (user_id, streak_days)
        VALUES (p_user_id, 1);
        
        RETURN QUERY SELECT 1, FALSE, 0;
        RETURN;
    END IF;
    
    -- Get the date of last activity
    last_activity_date := current_stats.last_activity::DATE;
    
    -- Calculate new streak
    IF last_activity_date = today_date THEN
        -- Already active today, no change to streak
        new_streak := current_stats.streak_days;
    ELSIF last_activity_date = today_date - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        new_streak := current_stats.streak_days + 1;
        
        -- Award streak bonus every 7 days
        IF new_streak % 7 = 0 THEN
            bonus_xp_amount := calculate_xp_reward('streak_bonus', 'medium', 30, new_streak / 7.0);
            PERFORM award_xp(p_user_id, bonus_xp_amount, 'streak_bonus');
            bonus_given := TRUE;
        END IF;
    ELSE
        -- Streak broken, reset to 1
        new_streak := 1;
    END IF;
    
    -- Update streak
    UPDATE public.game_stats 
    SET 
        streak_days = new_streak,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT new_streak, bonus_given, bonus_xp_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS TABLE(
    achievement_id UUID,
    achievement_name TEXT,
    xp_awarded INTEGER
) AS $$
DECLARE
    user_stats RECORD;
    achievement RECORD;
    condition_met BOOLEAN;
    total_study_time INTEGER;
    total_quests_completed INTEGER;
    current_streak INTEGER;
BEGIN
    -- Get user's current stats
    SELECT gs.*, up.created_at as user_created_at
    INTO user_stats
    FROM public.game_stats gs
    JOIN public.user_profiles up ON gs.user_id = up.id
    WHERE gs.user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Get additional stats
    SELECT COALESCE(SUM(duration), 0) INTO total_study_time
    FROM public.study_sessions
    WHERE user_id = p_user_id;
    
    SELECT COUNT(*) INTO total_quests_completed
    FROM public.quests
    WHERE user_id = p_user_id AND status = 'completed';
    
    current_streak := user_stats.streak_days;
    
    -- Check each achievement definition
    FOR achievement IN 
        SELECT ad.* 
        FROM public.achievement_definitions ad
        WHERE ad.id NOT IN (
            SELECT ua.achievement_id 
            FROM public.user_achievements ua 
            WHERE ua.user_id = p_user_id
        )
    LOOP
        condition_met := FALSE;
        
        -- Check conditions based on achievement type
        CASE achievement.category
            WHEN 'study_milestone' THEN
                -- Check study time milestones
                IF (achievement.unlock_conditions->>'study_hours')::INTEGER IS NOT NULL THEN
                    condition_met := total_study_time >= (achievement.unlock_conditions->>'study_hours')::INTEGER * 60;
                END IF;
                
            WHEN 'consistency' THEN
                -- Check streak milestones
                IF (achievement.unlock_conditions->>'streak_days')::INTEGER IS NOT NULL THEN
                    condition_met := current_streak >= (achievement.unlock_conditions->>'streak_days')::INTEGER;
                END IF;
                
            WHEN 'subject_mastery' THEN
                -- Check quest completion milestones
                IF (achievement.unlock_conditions->>'quests_completed')::INTEGER IS NOT NULL THEN
                    condition_met := total_quests_completed >= (achievement.unlock_conditions->>'quests_completed')::INTEGER;
                END IF;
                
            WHEN 'pet_care' THEN
                -- Check pet-related achievements (simplified for now)
                IF (achievement.unlock_conditions->>'pet_level')::INTEGER IS NOT NULL THEN
                    condition_met := EXISTS (
                        SELECT 1 FROM public.study_pets 
                        WHERE user_id = p_user_id 
                        AND level >= (achievement.unlock_conditions->>'pet_level')::INTEGER
                    );
                END IF;
        END CASE;
        
        -- Award achievement if condition is met
        IF condition_met THEN
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (p_user_id, achievement.id);
            
            -- Award XP for the achievement
            PERFORM award_xp(p_user_id, achievement.xp_reward, 'achievement_unlock');
            
            RETURN QUERY SELECT achievement.id, achievement.name, achievement.xp_reward;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;