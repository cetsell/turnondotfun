-- First, delete all existing data to ensure a clean slate
-- Delete in reverse order of dependencies to avoid foreign key constraint errors
DELETE FROM game_sessions;
DELETE FROM marketplace;
DELETE FROM characters;
DELETE FROM stories;

-- Handle the circular reference between users and assets
-- First, set avatar_id to NULL for all users
UPDATE users SET avatar_id = NULL;

-- Now we can safely delete assets and users
DELETE FROM assets;
DELETE FROM users;

-- Insert initial users
INSERT INTO users (user_id, username, email, preferences) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin', 'info@turnon.video', '{"isAdmin": true}'),
    ('00000000-0000-0000-0000-000000000002', 'guest', 'chad@turnon.video', '{"isGuest": true}');

-- Insert assets
-- First, let's add the VRM models
INSERT INTO assets (asset_id, type, creator_id, file_url, price, quality) VALUES
    ('00000000-0000-0000-0001-000000000001', 'model', '00000000-0000-0000-0000-000000000001', '/assets/avatar.vrm', 0.00, 'high'),
    ('00000000-0000-0000-0001-000000000002', 'model', '00000000-0000-0000-0000-000000000001', '/assets/0081501462b207a952db265a413a7454b2d59de443639059b823895f24745033.vrm', 10.00, 'high'),
    ('00000000-0000-0000-0001-000000000003', 'model', '00000000-0000-0000-0000-000000000001', '/assets/2cb754ed8f72aea04e0116fe948cab26ae4d26d35670e465d4af2e3f52784491.vrm', 10.00, 'high'),
    ('00000000-0000-0000-0001-000000000004', 'model', '00000000-0000-0000-0000-000000000001', '/assets/58f71e3a325d9c7d7dc46dceca0dc6f077b7c9593ca80e08e713c5a20e4aba57.vrm', 15.00, 'high'),
    ('00000000-0000-0000-0001-000000000005', 'model', '00000000-0000-0000-0000-000000000001', '/assets/7fca4a77fdc60ab2c78a9907430744562626180125fa386eb74fb2ea15c2e518.vrm', 15.00, 'high'),
    ('00000000-0000-0000-0001-000000000006', 'model', '00000000-0000-0000-0000-000000000001', '/assets/e219cd9ac581f272c9a0050029e17ad3b4cab6e94e31bf92c187502c5845ceb7.vrm', 12.00, 'high');

-- Add environment assets (HDR files)
INSERT INTO assets (asset_id, type, creator_id, file_url, price, quality) VALUES
    ('00000000-0000-0000-0002-000000000001', 'environment', '00000000-0000-0000-0000-000000000001', '/assets/night.hdr', 5.00, 'high'),
    ('00000000-0000-0000-0002-000000000002', 'environment', '00000000-0000-0000-0000-000000000001', '/assets/studio.hdr', 5.00, 'high'),
    ('00000000-0000-0000-0002-000000000003', 'environment', '00000000-0000-0000-0000-000000000001', '/assets/sunset.hdr', 5.00, 'high');

-- Add mocap assets (GLB animation files)
INSERT INTO assets (asset_id, type, creator_id, file_url, price, quality) VALUES
    ('00000000-0000-0000-0003-000000000001', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-fall.glb', 2.00, 'high'),
    ('00000000-0000-0000-0003-000000000002', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-flip.glb', 2.00, 'high'),
    ('00000000-0000-0000-0003-000000000003', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-float.glb', 2.00, 'high'),
    ('00000000-0000-0000-0003-000000000004', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-idle.glb', 2.00, 'high'),
    ('00000000-0000-0000-0003-000000000005', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-jump.glb', 2.00, 'high'),
    ('00000000-0000-0000-0003-000000000006', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-run.glb', 2.00, 'high'),
    ('00000000-0000-0000-0003-000000000007', 'mocap', '00000000-0000-0000-0000-000000000001', '/assets/emote-walk.glb', 2.00, 'high');

-- Add weapon and item assets
INSERT INTO assets (asset_id, type, creator_id, file_url, price, quality) VALUES
    ('00000000-0000-0000-0001-000000000007', 'model', '00000000-0000-0000-0000-000000000001', '/assets/cosmic-sword.glb', 250.00, 'high'),
    ('00000000-0000-0000-0001-000000000008', 'model', '00000000-0000-0000-0000-000000000001', '/assets/magic-shield.glb', 180.00, 'high'),
    ('00000000-0000-0000-0001-000000000009', 'model', '00000000-0000-0000-0000-000000000001', '/assets/dragon-armor.glb', 350.00, 'high'),
    ('00000000-0000-0000-0001-000000000010', 'model', '00000000-0000-0000-0000-000000000001', '/assets/healing-potion.glb', 75.00, 'high');

-- Set default avatar for admin and guest
UPDATE users 
SET avatar_id = '00000000-0000-0000-0001-000000000001' 
WHERE user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Create sample stories
INSERT INTO stories (story_id, title, creator_id, description, theme, ai_generated, world_data) VALUES
    ('00000000-0000-0000-0004-000000000001', 'Welcome to My World', '00000000-0000-0000-0000-000000000001', 'Your first adventure in the metaverse', 'Tutorial', false, '{"skybox": "/assets/studio.hdr", "startPosition": {"x": 0, "y": 0, "z": 0}}'),
    ('00000000-0000-0000-0004-000000000002', 'Dragon Quest', '00000000-0000-0000-0000-000000000001', 'Embark on an epic quest to defeat the dragon', 'Fantasy', false, '{"skybox": "/assets/night.hdr", "startPosition": {"x": 10, "y": 0, "z": 10}}'),
    ('00000000-0000-0000-0004-000000000003', 'Cyber City', '00000000-0000-0000-0000-000000000001', 'Explore the futuristic cyber city', 'Sci-Fi', false, '{"skybox": "/assets/sunset.hdr", "startPosition": {"x": -10, "y": 0, "z": -10}}'),
    ('00000000-0000-0000-0004-000000000004', 'Space Adventure', '00000000-0000-0000-0000-000000000001', 'Journey through the stars and discover new worlds', 'Space', true, '{"skybox": "/assets/night.hdr", "startPosition": {"x": 0, "y": 10, "z": 0}}');

-- Create sample characters for the stories
INSERT INTO characters (character_id, story_id, name, personality, dialogue, model_id, mocap_id) VALUES
    ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0004-000000000001', 'Guide', '{"friendliness": 9, "helpfulness": 10}', 'Welcome to My World! I''m here to help you get started.', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000004'),
    ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0004-000000000002', 'Dragon Slayer', '{"bravery": 10, "strength": 9}', 'The dragon must be defeated! Are you ready for the challenge?', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000006'),
    ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0004-000000000003', 'Cyber Detective', '{"intelligence": 10, "intuition": 8}', 'Something strange is happening in Cyber City. We need to investigate.', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0003-000000000007'),
    ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0004-000000000004', 'Space Captain', '{"leadership": 9, "adaptability": 10}', 'Welcome aboard the starship! Our mission is to explore new worlds.', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0003-000000000006');

-- Add marketplace listings for assets
INSERT INTO marketplace (listing_id, asset_id, price, status, creator_id) VALUES
    ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0001-000000000002', 10.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0001-000000000003', 10.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0002-000000000001', 5.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0001-000000000007', 250.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0001-000000000008', 180.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0001-000000000009', 350.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0001-000000000010', 75.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0003-000000000002', 2.00, 'active', '00000000-0000-0000-0000-000000000001');

-- Add marketplace listings for environments
INSERT INTO marketplace (listing_id, asset_id, price, status, creator_id) VALUES
    ('00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0002-000000000002', 5.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0002-000000000003', 5.00, 'active', '00000000-0000-0000-0000-000000000001');

-- Add marketplace listings for emotes
INSERT INTO marketplace (listing_id, asset_id, price, status, creator_id) VALUES
    ('00000000-0000-0000-0006-000000000014', '00000000-0000-0000-0003-000000000001', 2.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000015', '00000000-0000-0000-0003-000000000003', 2.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0003-000000000005', 2.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000017', '00000000-0000-0000-0003-000000000006', 2.00, 'active', '00000000-0000-0000-0000-000000000001');

-- Add marketplace listings for stories
INSERT INTO marketplace (listing_id, story_id, price, status, creator_id) VALUES
    ('00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0004-000000000002', 20.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0004-000000000003', 25.00, 'active', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0004-000000000004', 30.00, 'active', '00000000-0000-0000-0000-000000000001');

-- Create an initial game session
INSERT INTO game_sessions (session_id, story_id, user_ids, state) VALUES
    ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0004-000000000001', 
     '["00000000-0000-0000-0000-000000000002"]'::jsonb, 
     jsonb_build_object('active', true, 'startedAt', CURRENT_TIMESTAMP::text));
