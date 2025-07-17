-- Create additional tables for social features

-- Group challenges table
CREATE TABLE IF NOT EXISTS group_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('study_time', 'quest_completion', 'streak_maintenance', 'collaboration', 'custom')),
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    goal JSONB NOT NULL, -- Contains target, type, isCollective, description
    rewards JSONB DEFAULT '[]'::jsonb, -- Array of reward objects
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES group_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(challenge_id, user_id)
);

-- Study rooms table
CREATE TABLE IF NOT EXISTS study_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::jsonb, -- Room settings like maxParticipants, allowChat, etc.
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study room participants table
CREATE TABLE IF NOT EXISTS study_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('studying', 'break', 'away', 'offline')),
    is_host BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, user_id)
);

-- Group study sessions table
CREATE TABLE IF NOT EXISTS group_study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- in minutes
    stats JSONB DEFAULT '{}'::jsonb, -- Session statistics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group messages table
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'system', 'image', 'file')),
    reactions JSONB DEFAULT '[]'::jsonb, -- Array of reaction objects
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, invited_user)
);

-- Group activities table
CREATE TABLE IF NOT EXISTS group_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group leaderboards table (for caching leaderboard data)
CREATE TABLE IF NOT EXISTS group_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('xp', 'study_time', 'quests_completed', 'streak_days', 'contribution')),
    period VARCHAR(50) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    entries JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, type, period)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_challenges_group_id ON group_challenges(group_id);
CREATE INDEX IF NOT EXISTS idx_group_challenges_status ON group_challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_study_rooms_group_id ON study_rooms(group_id);
CREATE INDEX IF NOT EXISTS idx_study_rooms_is_active ON study_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_study_room_participants_room_id ON study_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_study_room_participants_user_id ON study_room_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_group_study_sessions_room_id ON group_study_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_group_study_sessions_start_time ON group_study_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON group_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_user ON group_invitations(invited_user);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);

CREATE INDEX IF NOT EXISTS idx_group_activities_group_id ON group_activities(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_created_at ON group_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_group_activities_type ON group_activities(type);

CREATE INDEX IF NOT EXISTS idx_group_leaderboards_group_id ON group_leaderboards(group_id);
CREATE INDEX IF NOT EXISTS idx_group_leaderboards_type_period ON group_leaderboards(type, period);

-- Add RLS policies for the new tables
ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_challenges
CREATE POLICY "Users can view challenges for groups they belong to" ON group_challenges
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can create challenges" ON group_challenges
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Challenge creators can update their challenges" ON group_challenges
    FOR UPDATE USING (created_by = auth.uid());

-- RLS policies for challenge_participants
CREATE POLICY "Users can view challenge participants for their groups" ON challenge_participants
    FOR SELECT USING (
        challenge_id IN (
            SELECT id FROM group_challenges 
            WHERE group_id IN (
                SELECT group_id FROM group_memberships 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can join challenges in their groups" ON challenge_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        challenge_id IN (
            SELECT id FROM group_challenges 
            WHERE group_id IN (
                SELECT group_id FROM group_memberships 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own challenge participation" ON challenge_participants
    FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for study_rooms
CREATE POLICY "Users can view study rooms for groups they belong to" ON study_rooms
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create study rooms" ON study_rooms
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Room creators can update their rooms" ON study_rooms
    FOR UPDATE USING (created_by = auth.uid());

-- RLS policies for study_room_participants
CREATE POLICY "Users can view room participants for accessible rooms" ON study_room_participants
    FOR SELECT USING (
        room_id IN (
            SELECT id FROM study_rooms 
            WHERE group_id IN (
                SELECT group_id FROM group_memberships 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can join study rooms in their groups" ON study_room_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        room_id IN (
            SELECT id FROM study_rooms 
            WHERE group_id IN (
                SELECT group_id FROM group_memberships 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own room participation" ON study_room_participants
    FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for group_messages
CREATE POLICY "Users can view messages for groups they belong to" ON group_messages
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can send messages" ON group_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON group_messages
    FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for group_invitations
CREATE POLICY "Users can view invitations sent to them or by them" ON group_invitations
    FOR SELECT USING (
        invited_user = auth.uid() OR 
        invited_by = auth.uid() OR
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group members can send invitations" ON group_invitations
    FOR INSERT WITH CHECK (
        invited_by = auth.uid() AND
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Invited users can respond to invitations" ON group_invitations
    FOR UPDATE USING (invited_user = auth.uid());

-- RLS policies for group_activities
CREATE POLICY "Users can view activities for groups they belong to" ON group_activities
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert group activities" ON group_activities
    FOR INSERT WITH CHECK (true);

-- RLS policies for group_leaderboards
CREATE POLICY "Users can view leaderboards for groups they belong to" ON group_leaderboards
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage leaderboards" ON group_leaderboards
    FOR ALL USING (true);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_group_challenges_updated_at BEFORE UPDATE ON group_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_rooms_updated_at BEFORE UPDATE ON study_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at BEFORE UPDATE ON group_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();