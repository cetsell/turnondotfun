-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables if they exist
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS marketplace CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create custom types
CREATE TYPE asset_type AS ENUM ('model', 'environment', 'mocap');
CREATE TYPE asset_quality AS ENUM ('high', 'low');
CREATE TYPE marketplace_status AS ENUM ('active', 'sold');

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    avatar_id UUID,  -- Will be updated with FK constraint after assets table is created
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
    story_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    creator_id UUID REFERENCES users(user_id),
    description TEXT,
    theme TEXT,
    ai_generated BOOLEAN DEFAULT false,
    world_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type asset_type NOT NULL,
    creator_id UUID REFERENCES users(user_id),
    file_url TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quality asset_quality NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK constraint to users.avatar_id
ALTER TABLE users 
ADD CONSTRAINT fk_users_avatar 
FOREIGN KEY (avatar_id) REFERENCES assets(asset_id);

-- Characters table
CREATE TABLE characters (
    character_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES stories(story_id),
    name TEXT NOT NULL,
    personality JSONB DEFAULT '{}',
    dialogue TEXT,
    model_id UUID REFERENCES assets(asset_id),
    mocap_id UUID REFERENCES assets(asset_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace table
CREATE TABLE marketplace (
    listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(asset_id),
    story_id UUID REFERENCES stories(story_id),
    price DECIMAL(10, 2) NOT NULL,
    status marketplace_status NOT NULL DEFAULT 'active',
    creator_id UUID REFERENCES users(user_id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure either asset_id or story_id is set, but not both
    CONSTRAINT check_listing_type CHECK (
        (asset_id IS NOT NULL AND story_id IS NULL) OR
        (asset_id IS NULL AND story_id IS NOT NULL)
    )
);

-- Game_Sessions table
CREATE TABLE game_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES stories(story_id) NOT NULL,
    user_ids JSONB NOT NULL DEFAULT '[]',
    state JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_updated_at
    BEFORE UPDATE ON marketplace
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_stories_creator ON stories(creator_id);
CREATE INDEX idx_assets_creator ON assets(creator_id);
CREATE INDEX idx_characters_story ON characters(story_id);
CREATE INDEX idx_marketplace_status ON marketplace(status);
CREATE INDEX idx_marketplace_creator ON marketplace(creator_id);
CREATE INDEX idx_game_sessions_story ON game_sessions(story_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (these should be refined based on your specific access requirements)
CREATE POLICY "Users can read all users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own record"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid()::text::uuid = user_id);

-- Similar policies should be created for other tables based on your access requirements
