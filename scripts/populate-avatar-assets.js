/**
 * Populate sample avatar assets in Supabase
 * 
 * This script adds sample assets to the avatar_assets table in Supabase
 * to provide test data for the character creator.
 * 
 * Usage: node scripts/populate-avatar-assets.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Sample avatar assets - with correct URLs for local assets
const sampleAssets = [
  // Base models
  {
    category: 'base_model',
    name: 'Male Base',
    description: 'Standard male body type',
    asset_url: '/assets/avatars/base_models/male-base.vrm',
    preview_image_url: '/assets/avatars/previews/male-base.jpg',
    compatibility: null
  },
  {
    category: 'base_model',
    name: 'Female Base',
    description: 'Standard female body type',
    asset_url: '/assets/avatars/base_models/female-base.vrm',
    preview_image_url: '/assets/avatars/previews/female-base.jpg',
    compatibility: null
  },
  
  // Hair models
  {
    category: 'hair_model',
    name: 'Short Casual',
    description: 'Short casual hairstyle',
    asset_url: '/assets/avatars/hair/short-casual.glb',
    preview_image_url: '/assets/avatars/previews/hair-short-casual.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'hair_model',
    name: 'Long Wavy',
    description: 'Long wavy hairstyle',
    asset_url: 'https://example.com/assets/hair-long-wavy.glb',
    preview_image_url: 'https://example.com/previews/hair-long-wavy.jpg',
    compatibility: ['female_base']
  },
  
  // Skin textures
  {
    category: 'skin_texture',
    name: 'Light Skin',
    description: 'Light skin tone texture',
    asset_url: 'https://example.com/assets/skin-light.jpg',
    preview_image_url: 'https://example.com/previews/skin-light.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'skin_texture',
    name: 'Medium Skin',
    description: 'Medium skin tone texture',
    asset_url: 'https://example.com/assets/skin-medium.jpg',
    preview_image_url: 'https://example.com/previews/skin-medium.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'skin_texture',
    name: 'Dark Skin',
    description: 'Dark skin tone texture',
    asset_url: 'https://example.com/assets/skin-dark.jpg',
    preview_image_url: 'https://example.com/previews/skin-dark.jpg',
    compatibility: ['male_base', 'female_base']
  },
  
  // Clothing - tops
  {
    category: 'clothing_top',
    name: 'T-Shirt',
    description: 'Basic t-shirt',
    asset_url: 'https://example.com/assets/top-tshirt.glb',
    preview_image_url: 'https://example.com/previews/top-tshirt.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'clothing_top',
    name: 'Hoodie',
    description: 'Casual hoodie',
    asset_url: 'https://example.com/assets/top-hoodie.glb',
    preview_image_url: 'https://example.com/previews/top-hoodie.jpg',
    compatibility: ['male_base', 'female_base']
  },
  
  // Clothing - bottoms
  {
    category: 'clothing_bottom',
    name: 'Jeans',
    description: 'Blue denim jeans',
    asset_url: 'https://example.com/assets/bottom-jeans.glb',
    preview_image_url: 'https://example.com/previews/bottom-jeans.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'clothing_bottom',
    name: 'Shorts',
    description: 'Casual shorts',
    asset_url: 'https://example.com/assets/bottom-shorts.glb',
    preview_image_url: 'https://example.com/previews/bottom-shorts.jpg',
    compatibility: ['male_base', 'female_base']
  },
  
  // Clothing - shoes
  {
    category: 'clothing_shoes',
    name: 'Sneakers',
    description: 'Casual sneakers',
    asset_url: 'https://example.com/assets/shoes-sneakers.glb',
    preview_image_url: 'https://example.com/previews/shoes-sneakers.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'clothing_shoes',
    name: 'Boots',
    description: 'Casual boots',
    asset_url: 'https://example.com/assets/shoes-boots.glb',
    preview_image_url: 'https://example.com/previews/shoes-boots.jpg',
    compatibility: ['male_base', 'female_base']
  },
  
  // Accessories
  {
    category: 'accessories',
    name: 'Glasses',
    description: 'Simple glasses',
    asset_url: 'https://example.com/assets/acc-glasses.glb',
    preview_image_url: 'https://example.com/previews/acc-glasses.jpg',
    compatibility: ['male_base', 'female_base']
  },
  {
    category: 'accessories',
    name: 'Hat',
    description: 'Baseball cap',
    asset_url: 'https://example.com/assets/acc-hat.glb',
    preview_image_url: 'https://example.com/previews/acc-hat.jpg',
    compatibility: ['male_base', 'female_base']
  }
];

async function populateAvatarAssets() {
  console.log('Connecting to Supabase...');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY in .env file.');
    process.exit(1);
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  
  console.log('Connected to Supabase. Populating avatar assets...');
  
  // Check if table exists
  try {
    const { error: tableError } = await supabase
      .from('avatar_assets')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking avatar_assets table:', tableError);
      console.log('Creating avatar_assets table...');
      
      // Table doesn't exist, create it
      await supabase.rpc('create_avatar_assets_table');
      console.log('Created avatar_assets table');
    }
  } catch (error) {
    console.error('Error checking/creating table:', error);
    process.exit(1);
  }
  
  // Insert sample assets
  try {
    // Clear existing assets if any
    const { error: deleteError } = await supabase
      .from('avatar_assets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (deleteError) {
      console.error('Error clearing existing assets:', deleteError);
    } else {
      console.log('Cleared existing assets');
    }
    
    // Insert new assets
    for (const asset of sampleAssets) {
      const { error } = await supabase
        .from('avatar_assets')
        .insert(asset);
      
      if (error) {
        console.error(`Error inserting asset "${asset.name}":`, error);
      } else {
        console.log(`Added asset: ${asset.category} - ${asset.name}`);
      }
    }
    
    console.log('Finished populating avatar assets');
  } catch (error) {
    console.error('Error populating assets:', error);
  }
}

// Run the script
populateAvatarAssets().catch(console.error); 