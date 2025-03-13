import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import https from 'https';
import http from 'http';

// Configuration
const DEFAULT_ASSETS_DIR = path.resolve(process.cwd(), 'world/default/assets');
const worldId = process.argv[2] || 'm7nk-NNHaMHw'; // Default to your world ID
const worldSpecificDir = path.resolve(process.cwd(), `world/${worldId}/assets`);

// List of default assets to download
const assetsList = [
  {
    url: 'https://cdn.glitch.global/c4e366b1-301d-44c5-b14c-3a025269ff4c/skybox.hdr?v=1668100494688',
    filename: 'skybox.hdr'
  },
  {
    url: 'https://cdn.glitch.global/c4e366b1-301d-44c5-b14c-3a025269ff4c/skybox.jpg?v=1668100494850',
    filename: 'skybox.jpg'
  },
  {
    url: 'https://cdn.glitch.global/c4e366b1-301d-44c5-b14c-3a025269ff4c/VRM_avatar.vrm?v=1668100491493',
    filename: 'avatar.vrm'
  },
  {
    url: 'https://cdn.glitch.global/c4e366b1-301d-44c5-b14c-3a025269ff4c/idle-emote.glb?v=1668100489723',
    filename: 'idle.glb'
  },
  {
    url: 'https://cdn.glitch.global/c4e366b1-301d-44c5-b14c-3a025269ff4c/dancing.glb?v=1668100490654',
    filename: 'dance.glb'
  },
  {
    url: 'https://cdn.glitch.global/c4e366b1-301d-44c5-b14c-3a025269ff4c/waving.glb?v=1668100490654',
    filename: 'wave.glb'
  }
];

/**
 * Download a file from URL and save to disk
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`Downloading ${url} to ${destination}`));
    
    // Create directory if it doesn't exist
    const dir = path.dirname(destination);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Choose http or https module based on URL
    const client = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(destination);
    
    client.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        console.log(chalk.yellow(`Redirecting to ${response.headers.location}`));
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(chalk.green(`✓ Downloaded ${path.basename(destination)}`));
        resolve();
      });
      
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  console.log(chalk.blue('=== Setting up directories ==='));
  
  // Create default assets directory
  if (!fs.existsSync(DEFAULT_ASSETS_DIR)) {
    console.log(chalk.yellow(`Creating default assets directory: ${DEFAULT_ASSETS_DIR}`));
    fs.mkdirSync(DEFAULT_ASSETS_DIR, { recursive: true });
  } else {
    console.log(chalk.green(`✓ Default assets directory exists: ${DEFAULT_ASSETS_DIR}`));
  }
  
  // Create world-specific assets directory
  if (!fs.existsSync(worldSpecificDir)) {
    console.log(chalk.yellow(`Creating world-specific assets directory: ${worldSpecificDir}`));
    fs.mkdirSync(worldSpecificDir, { recursive: true });
  } else {
    console.log(chalk.green(`✓ World-specific assets directory exists: ${worldSpecificDir}`));
  }
}

/**
 * Download default assets
 */
async function downloadDefaultAssets() {
  console.log(chalk.blue('=== Downloading default assets ==='));
  
  for (const asset of assetsList) {
    const defaultPath = path.join(DEFAULT_ASSETS_DIR, asset.filename);
    
    if (!fs.existsSync(defaultPath)) {
      try {
        await downloadFile(asset.url, defaultPath);
      } catch (error) {
        console.error(chalk.red(`Error downloading ${asset.filename}: ${error.message}`));
      }
    } else {
      console.log(chalk.green(`✓ Default asset already exists: ${asset.filename}`));
    }
  }
}

/**
 * Copy default assets to world-specific directory
 */
function copyDefaultAssetsToWorld() {
  console.log(chalk.blue(`=== Copying default assets to world: ${worldId} ===`));
  
  for (const asset of assetsList) {
    const defaultPath = path.join(DEFAULT_ASSETS_DIR, asset.filename);
    const worldPath = path.join(worldSpecificDir, asset.filename);
    
    if (fs.existsSync(defaultPath) && !fs.existsSync(worldPath)) {
      try {
        fs.copyFileSync(defaultPath, worldPath);
        console.log(chalk.green(`✓ Copied ${asset.filename} to world assets`));
      } catch (error) {
        console.error(chalk.red(`Error copying ${asset.filename}: ${error.message}`));
      }
    } else if (fs.existsSync(worldPath)) {
      console.log(chalk.green(`✓ World-specific asset already exists: ${asset.filename}`));
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.bold.green('=== Asset Download Tool ==='));
  console.log(`World ID: ${worldId}`);
  
  ensureDirectories();
  await downloadDefaultAssets();
  copyDefaultAssetsToWorld();
  
  console.log(chalk.bold.green('\n=== Completion ==='));
  console.log('Assets download and setup completed.');
  console.log('\nImportant reminders:');
  console.log('1. Default assets are located in: world/default/assets/');
  console.log('2. World-specific assets are located in: world/' + worldId + '/assets/');
  console.log('3. If you need additional assets, you can add them to these directories.');
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
});
