-- Seed data for achievement definitions
-- This file contains all the achievements available in the game

-- Study Milestone Achievements
INSERT INTO public.achievement_definitions (name, description, category, icon_url, xp_reward, unlock_conditions, rarity) VALUES
('First Steps', 'Complete your first study session', 'study_milestone', '/icons/achievements/first_steps.png', 25, '{"study_hours": 0.5}', 'common'),
('Study Rookie', 'Study for 5 hours total', 'study_milestone', '/icons/achievements/study_rookie.png', 50, '{"study_hours": 5}', 'common'),
('Dedicated Learner', 'Study for 25 hours total', 'study_milestone', '/icons/achievements/dedicated_learner.png', 100, '{"study_hours": 25}', 'common'),
('Study Warrior', 'Study for 50 hours total', 'study_milestone', '/icons/achievements/study_warrior.png', 200, '{"study_hours": 50}', 'rare'),
('Knowledge Seeker', 'Study for 100 hours total', 'study_milestone', '/icons/achievements/knowledge_seeker.png', 300, '{"study_hours": 100}', 'rare'),
('Study Master', 'Study for 250 hours total', 'study_milestone', '/icons/achievements/study_master.png', 500, '{"study_hours": 250}', 'epic'),
('Academic Legend', 'Study for 500 hours total', 'study_milestone', '/icons/achievements/academic_legend.png', 1000, '{"study_hours": 500}', 'legendary'),

-- Consistency Achievements
('Daily Habit', 'Maintain a 3-day study streak', 'consistency', '/icons/achievements/daily_habit.png', 75, '{"streak_days": 3}', 'common'),
('Week Warrior', 'Maintain a 7-day study streak', 'consistency', '/icons/achievements/week_warrior.png', 150, '{"streak_days": 7}', 'common'),
('Consistency King', 'Maintain a 14-day study streak', 'consistency', '/icons/achievements/consistency_king.png', 250, '{"streak_days": 14}', 'rare'),
('Unstoppable', 'Maintain a 30-day study streak', 'consistency', '/icons/achievements/unstoppable.png', 500, '{"streak_days": 30}', 'epic'),
('Legendary Streak', 'Maintain a 60-day study streak', 'consistency', '/icons/achievements/legendary_streak.png', 1000, '{"streak_days": 60}', 'legendary'),
('Century Club', 'Maintain a 100-day study streak', 'consistency', '/icons/achievements/century_club.png', 2000, '{"streak_days": 100}', 'legendary'),

-- Subject Mastery Achievements
('Quest Beginner', 'Complete your first quest', 'subject_mastery', '/icons/achievements/quest_beginner.png', 30, '{"quests_completed": 1}', 'common'),
('Quest Hunter', 'Complete 10 quests', 'subject_mastery', '/icons/achievements/quest_hunter.png', 100, '{"quests_completed": 10}', 'common'),
('Quest Master', 'Complete 25 quests', 'subject_mastery', '/icons/achievements/quest_master.png', 200, '{"quests_completed": 25}', 'common'),
('Quest Champion', 'Complete 50 quests', 'subject_mastery', '/icons/achievements/quest_champion.png', 350, '{"quests_completed": 50}', 'rare'),
('Quest Legend', 'Complete 100 quests', 'subject_mastery', '/icons/achievements/quest_legend.png', 600, '{"quests_completed": 100}', 'epic'),
('Quest God', 'Complete 250 quests', 'subject_mastery', '/icons/achievements/quest_god.png', 1200, '{"quests_completed": 250}', 'legendary'),

-- Pet Care Achievements
('Pet Parent', 'Adopt your first study pet', 'pet_care', '/icons/achievements/pet_parent.png', 50, '{"pet_level": 1}', 'common'),
('Pet Trainer', 'Evolve your pet to teen stage', 'pet_care', '/icons/achievements/pet_trainer.png', 150, '{"pet_evolution": "teen"}', 'common'),
('Pet Master', 'Evolve your pet to adult stage', 'pet_care', '/icons/achievements/pet_master.png', 300, '{"pet_evolution": "adult"}', 'rare'),
('Pet Legend', 'Evolve your pet to master stage', 'pet_care', '/icons/achievements/pet_legend.png', 750, '{"pet_evolution": "master"}', 'epic'),
('Pet Whisperer', 'Keep your pet happy for 30 days', 'pet_care', '/icons/achievements/pet_whisperer.png', 400, '{"pet_happiness_days": 30}', 'rare'),

-- Social Achievements
('Team Player', 'Join your first study group', 'social', '/icons/achievements/team_player.png', 75, '{"groups_joined": 1}', 'common'),
('Group Leader', 'Create a study group', 'social', '/icons/achievements/group_leader.png', 100, '{"groups_created": 1}', 'common'),
('Social Butterfly', 'Join 3 different study groups', 'social', '/icons/achievements/social_butterfly.png', 200, '{"groups_joined": 3}', 'rare'),
('Community Builder', 'Help 10 group members with their studies', 'social', '/icons/achievements/community_builder.png', 300, '{"members_helped": 10}', 'rare'),
('Mentor', 'Lead a study group for 30 days', 'social', '/icons/achievements/mentor.png', 500, '{"group_leadership_days": 30}', 'epic'),

-- Special Event Achievements (Seasonal)
('New Year Scholar', 'Study during New Year week', 'special_event', '/icons/achievements/new_year_scholar.png', 200, '{"event": "new_year"}', 'rare', true),
('Spring Learner', 'Complete 20 quests during spring', 'special_event', '/icons/achievements/spring_learner.png', 250, '{"event": "spring", "quests_completed": 20}', 'rare', true),
('Summer Student', 'Maintain 14-day streak during summer', 'special_event', '/icons/achievements/summer_student.png', 300, '{"event": "summer", "streak_days": 14}', 'rare', true),
('Fall Scholar', 'Study 50 hours during fall semester', 'special_event', '/icons/achievements/fall_scholar.png', 350, '{"event": "fall", "study_hours": 50}', 'rare', true),
('Holiday Helper', 'Help 5 group members during holidays', 'special_event', '/icons/achievements/holiday_helper.png', 400, '{"event": "holidays", "members_helped": 5}', 'epic', true),

-- Hidden Achievements
('Night Owl', 'Study for 10 hours between 10 PM and 6 AM', 'study_milestone', '/icons/achievements/night_owl.png', 150, '{"night_study_hours": 10}', 'rare', true),
('Early Bird', 'Study for 10 hours between 5 AM and 8 AM', 'study_milestone', '/icons/achievements/early_bird.png', 150, '{"morning_study_hours": 10}', 'rare', true),
('Marathon Runner', 'Study for 8 hours in a single day', 'study_milestone', '/icons/achievements/marathon_runner.png', 300, '{"single_day_hours": 8}', 'epic', true),
('Perfectionist', 'Complete 50 quests without missing any deadlines', 'subject_mastery', '/icons/achievements/perfectionist.png', 500, '{"perfect_quests": 50}', 'epic', true),
('Phoenix Rising', 'Come back after a 30-day break and study for 20 hours', 'consistency', '/icons/achievements/phoenix_rising.png', 400, '{"comeback_hours": 20, "break_days": 30}', 'epic', true),

-- Level-based Achievements
('Level Up!', 'Reach level 5', 'study_milestone', '/icons/achievements/level_5.png', 100, '{"level": 5}', 'common'),
('Rising Star', 'Reach level 10', 'study_milestone', '/icons/achievements/level_10.png', 200, '{"level": 10}', 'common'),
('Academic Elite', 'Reach level 25', 'study_milestone', '/icons/achievements/level_25.png', 500, '{"level": 25}', 'rare'),
('Study Sage', 'Reach level 50', 'study_milestone', '/icons/achievements/level_50.png', 1000, '{"level": 50}', 'epic'),
('Grandmaster', 'Reach level 100', 'study_milestone', '/icons/achievements/level_100.png', 2500, '{"level": 100}', 'legendary');

-- Update the is_hidden column for hidden achievements
UPDATE public.achievement_definitions 
SET is_hidden = true 
WHERE name IN ('Night Owl', 'Early Bird', 'Marathon Runner', 'Perfectionist', 'Phoenix Rising');

-- Update the is_seasonal column for seasonal achievements
UPDATE public.achievement_definitions 
SET is_seasonal = true 
WHERE category = 'special_event';