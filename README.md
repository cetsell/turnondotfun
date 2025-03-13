# Hyperfy ⚡️

## Overview

<div align="center">
  <img src="overview.png" alt="Hyperfy Ecosystem" width="100%" />
</div>

## 🧬 Features

- Standalone persistent world
- Host them on your own domain
- Connect via Hyperfy for portable avatars
- Realtime content creation in-world
- Realtime coding in-world (for devs)
- Fully interactive and interoperable app format
- Highly extensible

## 🦹‍♀️ Use Cases

- Live events
- Storefronts
- Podcasts
- Gaming
- Social

## 🚀 Quick Start

### Prerequisites

- Node 22.11.0+ (eg via nvm)

### Install

```bash
git clone https://github.com/hyperfy-xyz/hyperfy.git my-world
cd my-world
cp .env.example .env
npm install
npm run dev
```

## 🌱 Alpha

This project is still in alpha as we transition all of our [reference platform](https://github.com/hyperfy-xyz/hyperfy-ref) code into fully self hostable worlds.
Most features are already here in this repo but still need to be connected up to work with self hosting in mind.
Note that APIs are highly likely to change during this time.

# Turn On Dot Fun - 3D Game World Platform

A 3D game world platform with avatar customization, powered by Hyperfy.

## Avatar Customization System

The platform includes a modular avatar customization system that allows users to create and personalize their avatars, which persist across different game worlds.

### Features

- **Base Models**: Different body types with standardized skeletons
- **Modular Parts**: Separate VRM files for hair, clothing, and accessories
- **Runtime Assembly**: Dynamic loading and combining of parts
- **Customization**: Support for texture and material adjustments

### Technical Implementation

The avatar system uses VRM (Virtual Reality Model) format, which is an extension of glTF designed for humanoid avatars. The system:

1. Loads a base VRM model
2. Applies skin textures and materials
3. Attaches modular parts like hair, clothing, and accessories
4. Saves the configuration to be used across different worlds

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/turnondotfun.git
   cd turnondotfun
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create necessary directories for avatar assets:
   ```
   mkdir -p public/assets/avatars/{base_models,hair,clothing/top,clothing/bottom,footwear,accessories,textures,previews}
   ```

4. Add VRM models to the appropriate directories:
   - Base models: `public/assets/avatars/base_models/`
   - Hair models: `public/assets/avatars/hair/`
   - Clothing tops: `public/assets/avatars/clothing/top/`
   - Clothing bottoms: `public/assets/avatars/clothing/bottom/`
   - Footwear: `public/assets/avatars/footwear/`
   - Accessories: `public/assets/avatars/accessories/`
   - Textures: `public/assets/avatars/textures/`
   - Preview images: `public/assets/avatars/previews/`

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Using the Avatar Customizer

1. Log in to your account
2. Navigate to the Worlds page
3. Click on "Customize Avatar" button
4. Use the customization interface to:
   - Select a base model
   - Choose skin textures
   - Add hair styles
   - Select clothing items
   - Add accessories
5. Click "Save Avatar" to save your configuration
6. Your avatar will now be used in all game worlds

## Hyperfy Integration

The avatar system is designed to work with Hyperfy for 3D game world experiences. When a user enters a world:

1. The system loads the user's avatar configuration
2. It assembles the avatar from the saved components
3. The avatar is then used in the Hyperfy world

## Notes on VRM Blending

Hyperfy supports loading complete VRM models. For the best experience, the system:

1. Loads modular parts at runtime
2. Combines them into a single VRM
3. Ensures proper rigging and animation compatibility

This approach allows for maximum customization while maintaining performance and compatibility with Hyperfy's rendering system.

