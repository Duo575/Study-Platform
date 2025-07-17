-- Seed data for pet species
-- This file contains the initial pet species available in the game

INSERT INTO public.pet_species (name, description, base_happiness, base_health, evolution_stages, sprite_urls) VALUES
(
    'Dragon',
    'A mystical dragon companion that grows stronger with your dedication to learning. Dragons are known for their wisdom and fierce loyalty to their study partners.',
    60,
    70,
    '[
        {
            "stage": "egg",
            "name": "Dragon Egg",
            "description": "A mysterious egg with ancient runes",
            "requirements": {"study_hours": 0}
        },
        {
            "stage": "baby",
            "name": "Dragonling",
            "description": "A cute baby dragon with tiny wings",
            "requirements": {"study_hours": 10, "streak_days": 3}
        },
        {
            "stage": "teen",
            "name": "Young Dragon",
            "description": "A growing dragon learning to fly",
            "requirements": {"study_hours": 50, "streak_days": 7, "quests_completed": 20}
        },
        {
            "stage": "adult",
            "name": "Wise Dragon",
            "description": "A majestic dragon with powerful magic",
            "requirements": {"study_hours": 150, "streak_days": 14, "quests_completed": 75}
        },
        {
            "stage": "master",
            "name": "Ancient Dragon",
            "description": "A legendary dragon master of all knowledge",
            "requirements": {"study_hours": 500, "streak_days": 30, "quests_completed": 200}
        }
    ]'::jsonb,
    '{
        "egg": "/pets/dragon/egg.png",
        "baby": "/pets/dragon/baby.png",
        "teen": "/pets/dragon/teen.png",
        "adult": "/pets/dragon/adult.png",
        "master": "/pets/dragon/master.png"
    }'::jsonb
),
(
    'Phoenix',
    'A magnificent phoenix that rises from the ashes of procrastination. Phoenix companions inspire resilience and help you bounce back from setbacks.',
    55,
    65,
    '[
        {
            "stage": "egg",
            "name": "Phoenix Egg",
            "description": "A warm, glowing egg with fiery patterns",
            "requirements": {"study_hours": 0}
        },
        {
            "stage": "baby",
            "name": "Phoenix Chick",
            "description": "A small bird with flickering flames",
            "requirements": {"study_hours": 8, "streak_days": 2}
        },
        {
            "stage": "teen",
            "name": "Fire Phoenix",
            "description": "A beautiful bird with bright orange plumage",
            "requirements": {"study_hours": 40, "streak_days": 5, "quests_completed": 15}
        },
        {
            "stage": "adult",
            "name": "Blazing Phoenix",
            "description": "A stunning phoenix with magnificent fire wings",
            "requirements": {"study_hours": 120, "streak_days": 10, "quests_completed": 60}
        },
        {
            "stage": "master",
            "name": "Eternal Phoenix",
            "description": "An immortal phoenix radiating wisdom and power",
            "requirements": {"study_hours": 400, "streak_days": 25, "quests_completed": 150}
        }
    ]'::jsonb,
    '{
        "egg": "/pets/phoenix/egg.png",
        "baby": "/pets/phoenix/baby.png",
        "teen": "/pets/phoenix/teen.png",
        "adult": "/pets/phoenix/adult.png",
        "master": "/pets/phoenix/master.png"
    }'::jsonb
),
(
    'Owl',
    'A wise owl companion perfect for night study sessions. Owls are symbols of wisdom and help improve focus during late-night cramming.',
    50,
    60,
    '[
        {
            "stage": "egg",
            "name": "Owl Egg",
            "description": "A speckled egg hidden in a cozy nest",
            "requirements": {"study_hours": 0}
        },
        {
            "stage": "baby",
            "name": "Owlet",
            "description": "A fluffy baby owl with big curious eyes",
            "requirements": {"study_hours": 5, "streak_days": 2}
        },
        {
            "stage": "teen",
            "name": "Young Owl",
            "description": "A growing owl learning to hunt for knowledge",
            "requirements": {"study_hours": 25, "streak_days": 4, "quests_completed": 10}
        },
        {
            "stage": "adult",
            "name": "Wise Owl",
            "description": "A majestic owl with piercing intelligent eyes",
            "requirements": {"study_hours": 80, "streak_days": 8, "quests_completed": 40}
        },
        {
            "stage": "master",
            "name": "Scholar Owl",
            "description": "An ancient owl keeper of all academic secrets",
            "requirements": {"study_hours": 300, "streak_days": 20, "quests_completed": 120}
        }
    ]'::jsonb,
    '{
        "egg": "/pets/owl/egg.png",
        "baby": "/pets/owl/baby.png",
        "teen": "/pets/owl/teen.png",
        "adult": "/pets/owl/adult.png",
        "master": "/pets/owl/master.png"
    }'::jsonb
),
(
    'Cat',
    'A curious cat companion that loves to sit on your books. Cats provide comfort during stressful study sessions and remind you to take breaks.',
    70,
    55,
    '[
        {
            "stage": "egg",
            "name": "Cat Egg",
            "description": "A soft, furry egg that purrs gently",
            "requirements": {"study_hours": 0}
        },
        {
            "stage": "baby",
            "name": "Kitten",
            "description": "An adorable kitten that loves to play",
            "requirements": {"study_hours": 3, "streak_days": 1}
        },
        {
            "stage": "teen",
            "name": "Young Cat",
            "description": "A playful cat exploring the world of learning",
            "requirements": {"study_hours": 15, "streak_days": 3, "quests_completed": 8}
        },
        {
            "stage": "adult",
            "name": "Study Cat",
            "description": "A calm cat that enjoys quiet study sessions",
            "requirements": {"study_hours": 60, "streak_days": 6, "quests_completed": 30}
        },
        {
            "stage": "master",
            "name": "Professor Cat",
            "description": "A distinguished cat wearing tiny glasses",
            "requirements": {"study_hours": 250, "streak_days": 15, "quests_completed": 100}
        }
    ]'::jsonb,
    '{
        "egg": "/pets/cat/egg.png",
        "baby": "/pets/cat/baby.png",
        "teen": "/pets/cat/teen.png",
        "adult": "/pets/cat/adult.png",
        "master": "/pets/cat/master.png"
    }'::jsonb
),
(
    'Robot',
    'A high-tech robot companion for the digital age. Robots excel at organizing study schedules and providing systematic learning approaches.',
    45,
    80,
    '[
        {
            "stage": "egg",
            "name": "Robot Core",
            "description": "A glowing technological core waiting to activate",
            "requirements": {"study_hours": 0}
        },
        {
            "stage": "baby",
            "name": "Basic Bot",
            "description": "A simple robot learning basic functions",
            "requirements": {"study_hours": 12, "streak_days": 4}
        },
        {
            "stage": "teen",
            "name": "Study Bot",
            "description": "An advanced robot with learning algorithms",
            "requirements": {"study_hours": 60, "streak_days": 8, "quests_completed": 25}
        },
        {
            "stage": "adult",
            "name": "AI Assistant",
            "description": "A sophisticated AI with vast knowledge",
            "requirements": {"study_hours": 180, "streak_days": 12, "quests_completed": 80}
        },
        {
            "stage": "master",
            "name": "Quantum AI",
            "description": "An ultimate AI companion with quantum processing",
            "requirements": {"study_hours": 600, "streak_days": 35, "quests_completed": 250}
        }
    ]'::jsonb,
    '{
        "egg": "/pets/robot/core.png",
        "baby": "/pets/robot/basic.png",
        "teen": "/pets/robot/study.png",
        "adult": "/pets/robot/ai.png",
        "master": "/pets/robot/quantum.png"
    }'::jsonb
);