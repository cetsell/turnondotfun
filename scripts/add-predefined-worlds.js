/**
 * Add predefined worlds to Supabase
 * 
 * This script adds predefined worlds to the Supabase worlds table.
 * These worlds will be available for users to visit without creating new instances.
 * 
 * Usage: node scripts/add-predefined-worlds.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Define predefined worlds to add
const predefinedWorlds = [
  {
    id: 'default',
    title: 'Default World',
    description: 'The main world where everyone starts',
    is_public: true
  },
  {
    id: 'plaza',
    title: 'Central Plaza',
    description: 'A public gathering space with shops and activities',
    is_public: true
  },
  {
    id: 'gallery',
    title: 'Art Gallery',
    description: 'Showcase your NFTs and digital art',
    is_public: true
  },
  {
    id: 'arcade',
    title: 'Game Arcade',
    description: 'Play mini-games and compete with friends',
    is_public: true
  }
  // Add more predefined worlds as needed
];

async function addPredefinedWorlds() {
  console.log('Connecting to Supabase...');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY in .env file.');
    process.exit(1);
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  
  console.log('Connected to Supabase. Adding predefined worlds...');
  
  // Ensure worlds directory exists
  const rootDir = path.resolve(__dirname, '..');
  const worldsDir = path.join(rootDir, 'worlds');
  
  if (!fs.existsSync(worldsDir)) {
    fs.mkdirSync(worldsDir, { recursive: true });
    console.log(`Created worlds directory: ${worldsDir}`);
  }
  
  // Add each predefined world
  for (const world of predefinedWorlds) {
    try {
      // Check if world already exists
      const { data: existingWorld, error: checkError } = await supabase
        .from('worlds')
        .select('id')
        .eq('id', world.id)
        .single();
      
      if (!checkError && existingWorld) {
        console.log(`World "${world.title}" (${world.id}) already exists, skipping...`);
        continue;
      }
      
      // Create world directory if it doesn't exist
      const worldDir = path.join(worldsDir, world.id);
      const worldAssetsDir = path.join(worldDir, 'assets');
      
      if (!fs.existsSync(worldDir)) {
        fs.mkdirSync(worldDir, { recursive: true });
        console.log(`Created world directory: ${worldDir}`);
      }
      
      if (!fs.existsSync(worldAssetsDir)) {
        fs.mkdirSync(worldAssetsDir, { recursive: true });
        console.log(`Created world assets directory: ${worldAssetsDir}`);
      }
      
      // Copy core assets if they exist
      const coreAssetsDir = path.join(rootDir, 'src/core/assets');
      if (fs.existsSync(coreAssetsDir)) {
        // Simple recursive copy function
        const copyDir = (src, dest) => {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          
          const entries = fs.readdirSync(src, { withFileTypes: true });
          
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
              copyDir(srcPath, destPath);
            } else if (!fs.existsSync(destPath)) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        };
        
        copyDir(coreAssetsDir, worldAssetsDir);
        console.log(`Copied core assets to ${worldAssetsDir}`);
      }
      
      // Add world to Supabase
      const now = new Date().toISOString();
      const { error: insertError } = await supabase
        .from('worlds')
        .insert({
          ...world,
          created_at: now,
          updated_at: now
        });
      
      if (insertError) {
        console.error(`Error adding world "${world.title}":`, insertError);
      } else {
        console.log(`Added world: ${world.title} (${world.id})`);
      }
    } catch (error) {
      console.error(`Error processing world "${world.title}":`, error);
    }
  }
  
  console.log('Finished adding predefined worlds');
}

addPredefinedWorlds(); 