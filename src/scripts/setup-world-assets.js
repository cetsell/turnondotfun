import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Configuration
const worldAssetsDir = path.resolve(process.cwd(), 'world/assets');
const worldSpecificDir = path.resolve(process.cwd(), 'world');

/**
 * Ensure default assets directory exists
 */
function ensureDefaultAssetsDirectory() {
  console.log(chalk.blue('=== Setting up default assets directory ==='));
  
  if (!fs.existsSync(worldAssetsDir)) {
    console.log(chalk.yellow(`Creating default assets directory: ${worldAssetsDir}`));
    fs.mkdirSync(worldAssetsDir, { recursive: true });
  } else {
    console.log(chalk.green(`✓ Default assets directory exists: ${worldAssetsDir}`));
  }
  
  // Check for essential assets in default directory
  const essentialAssets = [
    'avatar.vrm',
    'skybox.hdr',
    'emote-idle.glb'
  ];
  
  const missingAssets = [];
  
  essentialAssets.forEach(asset => {
    const assetPath = path.join(worldAssetsDir, asset);
    if (!fs.existsSync(assetPath)) {
      missingAssets.push(asset);
    }
  });
  
  if (missingAssets.length > 0) {
    console.log(chalk.yellow(`⚠️ Missing essential assets in default directory: ${missingAssets.join(', ')}`));
    console.log(chalk.yellow(`Please add these assets to ${worldAssetsDir}`));
  } else {
    console.log(chalk.green(`✓ All essential assets present in default directory`));
  }
}

/**
 * Setup assets for specified world ID
 */
function setupWorldAssets(worldId) {
  if (!worldId) {
    console.error(chalk.red('No world ID specified. Usage: npm run setup-world-assets -- <worldId>'));
    process.exit(1);
  }
  
  const worldDir = path.join(worldSpecificDir, worldId);
  const worldAssetsDir = path.join(worldDir, 'assets');
  
  console.log(chalk.blue(`=== Setting up assets for world: ${worldId} ===`));
  
  // Create world directory if it doesn't exist
  if (!fs.existsSync(worldDir)) {
    console.log(chalk.yellow(`Creating world directory: ${worldDir}`));
    fs.mkdirSync(worldDir, { recursive: true });
  } else {
    console.log(chalk.green(`✓ World directory exists: ${worldDir}`));
  }
  
  // Create world assets directory if it doesn't exist
  if (!fs.existsSync(worldAssetsDir)) {
    console.log(chalk.yellow(`Creating world assets directory: ${worldAssetsDir}`));
    fs.mkdirSync(worldAssetsDir, { recursive: true });
  } else {
    console.log(chalk.green(`✓ World assets directory exists: ${worldAssetsDir}`));
  }
  
  // Copy default assets if world assets directory is empty
  const worldAssets = fs.readdirSync(worldAssetsDir);
  
  if (worldAssets.length === 0) {
    console.log(chalk.yellow(`World assets directory is empty, copying default assets...`));
    
    // On macOS, use cp command to copy assets
    try {
      execSync(`cp -R "${path.join(path.resolve(process.cwd()), 'world/assets')}"/* "${worldAssetsDir}/"`);
      console.log(chalk.green(`✓ Default assets copied to world assets directory`));
    } catch (error) {
      console.error(chalk.red(`Error copying default assets: ${error.message}`));
      console.log(chalk.yellow(`You may need to manually copy assets from ${path.join(path.resolve(process.cwd()), 'world/assets')} to ${worldAssetsDir}`));
    }
  } else {
    console.log(chalk.green(`✓ World assets directory already contains ${worldAssets.length} files/folders`));
  }
}

/**
 * Main function
 */
function main() {
  const worldId = process.argv[2];
  
  console.log(chalk.bold.green('=== World Assets Setup Tool ==='));
  
  ensureDefaultAssetsDirectory();
  
  if (worldId) {
    setupWorldAssets(worldId);
  } else {
    console.log(chalk.yellow('\nNo world ID specified. Only default assets directory was checked.'));
    console.log(chalk.yellow('To setup a specific world, run: npm run setup-world-assets -- <worldId>'));
  }
  
  console.log(chalk.bold.green('\n=== Completion ==='));
  console.log('Assets setup completed.');
  console.log('\nImportant reminders:');
  console.log('1. Default assets are located in: world/assets/');
  console.log('2. World-specific assets are located in: world/<worldId>/assets/');
  console.log('3. The system will first look for assets in the world-specific directory');
  console.log('4. If not found, it will fall back to the default assets directory');
}

// Run the main function
main();
