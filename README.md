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

## Home Page Setup

The home page features a modern, interactive design with several key sections:

1. **Hero Section**: Features a looping video or animated 3D scene with a ThreeJS fallback.
2. **Key Features**: Showcases the main features of the platform with images and descriptions.
3. **Interactive Demo**: Allows users to try out the AI storytelling capabilities.
4. **Social Proof**: Displays testimonials and statistics.
5. **Call to Action**: Encourages users to sign up or explore the marketplace.

### Landing Page Path

The landing page is accessible at:

```
http://localhost:3000/home
```

The root path (`/`) is reserved for the main game world, which includes a banner linking to the landing page.

### Image Setup

For the home page to display correctly, you'll need to set up the following image directories:

```bash
mkdir -p public/images/features
mkdir -p public/videos
```

#### Required Images:

- `/public/images/hero-poster.jpg` - Hero section background poster
- `/public/images/features/rich-narratives.jpg` - Rich narratives feature image
- `/public/images/features/unique-characters.jpg` - Unique characters feature image
- `/public/images/features/real-time-3d.jpg` - Real-time 3D feature image
- `/public/images/features/creator-marketplace.jpg` - Creator marketplace feature image
- `/public/images/interactive-demo.jpg` - Interactive demo section image

#### Required Videos:

- `/public/videos/hero-background.mp4` - Hero section background video

### Development Mode

In development mode, placeholder images will be generated automatically using the `FeatureImages` component. These are for development purposes only and should be replaced with high-quality images for production.

# TurnOnDotFun - Built on Hyperfy

This project is built on top of the [Hyperfy](https://github.com/hyperfy-xyz/hyperfy) platform, with custom extensions and features for TurnOnDotFun.

## Repository Structure

This repository is set up to track both our custom development and upstream changes from the Hyperfy project:

- `main` branch: Tracks the upstream Hyperfy main branch
- `dev` branch: Contains our custom development and modifications

## Staying Up to Date with Hyperfy

To pull in the latest changes from the Hyperfy project:

```bash
# Make sure you're on the main branch
git checkout main

# Pull the latest changes from Hyperfy
git pull upstream main

# Switch back to our development branch
git checkout dev

# Merge the changes from main into dev
git merge main
```

This workflow allows us to stay up to date with Hyperfy's development while maintaining our own customizations.

## Development

All custom development should be done on the `dev` branch or feature branches created from `dev`.

## Deployment

Deployment instructions and workflows will be added here.
