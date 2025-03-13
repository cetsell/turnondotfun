# Architecture Documentation

This document outlines the architecture of the AI-Powered Real-Time 3D Dating Simulator RPG, describing the purpose and relationships between different files, modules, and components.

## Project Structure

```
src/
├── client/              # Client-side application code
│   ├── auth/            # Authentication-related components
│   ├── components/      # UI components
│   ├── context/         # React context providers
│   ├── public/          # Static assets
│   ├── styles/          # CSS and styling files
│   ├── theme/           # Theming system
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application component
│   ├── AvatarPreview.js # Avatar preview functionality
│   ├── index.js         # Application entry point
│   └── world-client.js  # Hyperfy world client integration
├── core/                # Core game logic and shared code
└── server/              # Server-side code
```

## Key Components

### Authentication System

The authentication system is built on Supabase and provides user registration, login, and session management. It consists of:

- `auth/AuthContext.jsx`: React context providing authentication state and methods throughout the application
- `components/Login.jsx`: Login form component
- `components/Signup.jsx`: Registration form component

The auth system ensures that only authenticated users can access the game world and provides user identity for data persistence.

### Lobby System

The lobby serves as the entry point to the game and provides access to various features:

- `components/LandingPage.jsx`: Initial page displayed to users
- `components/WorldSelector.jsx`: Interface for selecting which world to enter
- `components/AvatarCustomizer.jsx`: Comprehensive avatar customization system

### Avatar Customization

The avatar system allows players to personalize their in-game representation:

- `components/AvatarCustomizer.jsx`: UI for customizing avatars
- `components/CharacterPreview.jsx`: Real-time preview of customization changes
- `AvatarPreview.js`: Handles the 3D rendering of avatars

Customization options include base model, skin, hair, clothing (top, bottom, shoes), and accessories.

### Hyperfy Integration

Hyperfy provides the real-time 3D engine powering the game world:

- `world-client.js`: Connects to Hyperfy backend and handles world loading
- `worlds/`: Directory containing Hyperfy world definitions

The application leverages Hyperfy's built-in capabilities for:
- 3D world rendering
- Physics and movement
- Multiplayer networking (future expansion)
- Shop/inventory systems

### UI System

The UI is built with React components and Tailwind CSS:

- `theme/ThemeProvider.jsx`: Centralized theme management
- `components/AnimatedBackground.jsx`: Dynamic background for non-game screens
- Various overlay components for in-game HUD and interaction interfaces

## Data Flow

1. User authentication state is managed by AuthContext and stored in Supabase
2. User profile, including avatar customization, is stored in Supabase
3. Game state (player stats, inventory) will be persisted to Supabase
4. World state is managed by Hyperfy's internal systems
5. UI components react to changes in auth state, game state, and world state

## Technical Integration Points

### Supabase Integration

Supabase serves as the backend for:
- User authentication
- Player data storage
- Game state persistence
- Marketplace metadata

### Hyperfy Integration

Hyperfy provides the 3D world infrastructure:
- World rendering and physics
- Character movement and interaction
- Asset loading and management

Assets for Hyperfy are stored locally and bundled into .hyp app files for distribution. These files contain the 3D environments, models, and textures required for each level.

## Future Architecture Considerations

1. **Database Schema Extensions**: As features are added, the Supabase schema will expand to support:
   - Player progression (XP, levels, stats)
   - Inventory and purchased items
   - Character relationship tracking
   - Leaderboards and social features

2. **Marketplace Integration**: The marketplace will connect Supabase (for metadata and transactions) with Hyperfy's asset loading system.

3. **LLM Integration**: Future versions will integrate AI language models for dynamic character conversations.
