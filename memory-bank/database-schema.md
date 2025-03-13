# Database Schema Documentation

This document outlines the Supabase database schema for the AI-Powered Real-Time 3D Dating Simulator RPG, including tables, relationships, and data models.

## Current Schema

### Authentication Tables (Managed by Supabase Auth)

Supabase Auth automatically manages the following tables:

- `auth.users`: Core user accounts
- `auth.sessions`: User session information
- `auth.refresh_tokens`: Token storage for authentication

### Users

Stores user information and preferences.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key |
| auth_id | uuid | References auth.users.id |
| username | text | User's display name |
| email | text | Email address for authentication |
| avatar_id | uuid | Foreign key to owned avatar |
| preferences | jsonb | JSON field for story/character preferences |
| created_at | timestamp | When the user was created |
| updated_at | timestamp | When the user was last updated |
| data | jsonb | JSON for storing miscellaneous data |

### Stories

Defines story environments and settings.

| Column | Type | Description |
|--------|------|-------------|
| story_id | uuid | Primary key |
| title | text | Story name |
| creator_id | uuid | Foreign key to Users table |
| description | text | Short summary of the story |
| theme | text | Category (e.g., "Romance," "Mystery") |
| ai_generated | boolean | Whether it was AI-made |
| world_data | jsonb | JSON for 3D environment settings |
| created_at | timestamp | When the story was created |
| updated_at | timestamp | When the story was last updated |
| data | jsonb | Additional story data |

### Characters

Defines NPCs and their attributes.

| Column | Type | Description |
|--------|------|-------------|
| character_id | uuid | Primary key |
| story_id | uuid | Foreign key to Stories (optional if standalone) |
| name | text | Character name |
| personality | jsonb | JSON storing traits (e.g., {"boldness": 8, "charm": 9}) |
| dialogue | jsonb/text | AI-generated lines or dialogue tree |
| model_id | uuid | Foreign key to 3D model in Assets |
| mocap_id | uuid | Foreign key to motion data in Assets |
| created_at | timestamp | When the character was created |
| updated_at | timestamp | When the character was last updated |
| data | jsonb | Additional character data |

### Assets

Stores 3D models, environments, and motion data.

| Column | Type | Description |
|--------|------|-------------|
| asset_id | uuid | Primary key |
| type | enum | Asset type (e.g., "model," "environment," "mocap") |
| creator_id | uuid | Foreign key to Users |
| file_url | text | Storage link (e.g., S3 bucket) |
| price | integer | Cost in virtual currency |
| quality | enum | Quality level (e.g., "high," "low" for AI-generated vs. premium) |
| name | text | Asset name |
| description | text | Asset description |
| created_at | timestamp | When the asset was created |
| updated_at | timestamp | When the asset was last updated |
| data | jsonb | Additional asset data |

### Marketplace

Facilitates the buying and selling of assets and stories.

| Column | Type | Description |
|--------|------|-------------|
| listing_id | uuid | Primary key |
| asset_id/story_id | uuid | Foreign key to item being sold |
| price | integer | Listing price |
| status | enum | Status (e.g., "active," "sold") |
| creator_id | uuid | Foreign key to seller |
| description | text | Listing description |
| created_at | timestamp | When the listing was created |
| updated_at | timestamp | When the listing was last updated |
| data | jsonb | Additional listing data |

### Game_Sessions

Tracks active gameplay sessions.

| Column | Type | Description |
|--------|------|-------------|
| session_id | uuid | Primary key |
| story_id | uuid | Foreign key to Stories |
| user_ids | jsonb | Array or JSON of participants |
| state | jsonb | JSON for real-time game state (e.g., player positions) |
| created_at | timestamp | When the session was created |
| updated_at | timestamp | When the session was last updated |
| data | jsonb | Additional session data |

### avatar_Assets

Stores assets for the user avatar customization tool.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| category | text | Asset category (e.g., "hair", "clothing") |
| name | text | Asset name |
| description | text | Asset description |
| asset_url | text | URL to the 3D asset |
| preview_image_url | text | URL to the preview image |
| compatibility | jsonb | Compatibility with other assets |

## Database Relationships

- One-to-many relationship between `Users` and `Stories` (creator)
- One-to-many relationship between `Stories` and `Characters`
- One-to-many relationship between `Users` and `Assets` (creator)
- One-to-many relationship between `Assets` and `Characters` (model, mocap)
- One-to-many relationship between `Users` and `Marketplace` (seller)
- One-to-many relationship between `Stories` and `Game_Sessions`
- One-to-one relationship between `Users` and `avatar_id` in Assets

## RLS Policies (Row Level Security)

The following RLS policies should be implemented to secure data:

1. Users can only update their own user data
2. Stories are readable by all but only editable by creator
3. Characters are readable by all but only editable by story creator
4. Assets are readable by all but only editable by creator
5. Marketplace listings are readable by all but only editable by creator
6. Game_Sessions are only accessible by participants
7. avatar_Assets are readable by all authenticated users

## Indexes

The following indexes should be created for performance:

1. `Users(username)` for username lookups
2. `Stories(creator_id)` for finding stories by creator
3. `Characters(story_id)` for finding characters in a story
4. `Assets(creator_id)` for finding assets by creator
5. `Marketplace(status)` for filtering active listings
6. `Game_Sessions(story_id)` for finding sessions by story
7. `avatar_Assets(category)` for filtering avatar assets by category

## Future Schema Extensions

As development progresses, the schema will be extended to include:

1. **User Relationships**: Friend connections and social features
2. **Achievements**: Track player progress and accomplishments
3. **Transactions**: History of marketplace purchases
4. **Ratings**: User ratings for stories, characters, and assets
5. **Comments**: User feedback on content
6. **Analytics**: Usage data for improving the platform 