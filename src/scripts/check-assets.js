import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Configuration
const assetsDir = path.resolve(process.cwd(), 'public/assets');
const worldsDir = path.resolve(process.cwd(), 'src/worlds');

/**
 * Check the assets directory structure and report issues
 */
function checkAssetsDirectory() {
  console.log(chalk.blue('=== Asset Directory Structure Check ==='));
  
  if (!fs.existsSync(assetsDir)) {
    console.log(chalk.red(`❌ Assets directory does not exist: ${assetsDir}`));
    console.log(chalk.yellow(`Recommendation: Create directory: mkdir -p ${assetsDir}`));
    return;
  }
  
  console.log(chalk.green(`✓ Assets directory exists: ${assetsDir}`));
  
  // List all world directories
  try {
    const worlds = fs.readdirSync(worldsDir)
      .filter(item => {
        const stats = fs.statSync(path.join(worldsDir, item));
        return stats.isDirectory();
      });
    
    console.log(chalk.blue(`Found ${worlds.length} worlds in ${worldsDir}`));
    
    // Check if each world has an asset directory
    worlds.forEach(world => {
      const worldAssetDir = path.join(assetsDir, world);
      
      if (!fs.existsSync(worldAssetDir)) {
        console.log(chalk.yellow(`⚠️ No asset directory for world '${world}': ${worldAssetDir}`));
        console.log(chalk.yellow(`Recommendation: Create directory: mkdir -p ${worldAssetDir}`));
      } else {
        console.log(chalk.green(`✓ Asset directory exists for world '${world}'`));
        
        // Check for common required assets
        const requiredAssets = ['avatar.vrm', 'skybox.hdr'];
        
        requiredAssets.forEach(asset => {
          const assetPath = path.join(worldAssetDir, asset);
          
          if (!fs.existsSync(assetPath)) {
            console.log(chalk.yellow(`⚠️ Missing '${asset}' in world '${world}'`));
          } else {
            const stats = fs.statSync(assetPath);
            console.log(chalk.green(`✓ Found '${asset}' (${formatFileSize(stats.size)}) in world '${world}'`));
          }
        });
        
        // Check for emotes
        const emotesDir = path.join(worldAssetDir, 'emotes');
        if (!fs.existsSync(emotesDir)) {
          console.log(chalk.yellow(`⚠️ No emotes directory for world '${world}'`));
        } else {
          const emotes = fs.readdirSync(emotesDir)
            .filter(file => file.endsWith('.glb') || file.endsWith('.vrm'));
          
          console.log(chalk.green(`✓ Found ${emotes.length} emotes for world '${world}'`));
        }
      }
    });
    
  } catch (error) {
    console.log(chalk.red(`❌ Error reading worlds directory: ${error.message}`));
  }
}

/**
 * Check for CORS configuration
 */
function checkCorsConfiguration() {
  console.log(chalk.blue('\n=== CORS Configuration Check ==='));
  
  // Check for .htaccess in assets directory (for Apache)
  const htaccessPath = path.join(assetsDir, '.htaccess');
  
  if (fs.existsSync(htaccessPath)) {
    console.log(chalk.green(`✓ Found .htaccess file for assets`));
    
    // Read and check content
    const content = fs.readFileSync(htaccessPath, 'utf8');
    
    if (content.includes('Header set Access-Control-Allow-Origin "*"')) {
      console.log(chalk.green(`✓ .htaccess contains CORS headers`));
    } else {
      console.log(chalk.yellow(`⚠️ .htaccess might not have proper CORS headers`));
      console.log(chalk.yellow(`Recommendation: Add CORS headers to .htaccess`));
    }
  } else {
    console.log(chalk.yellow(`⚠️ No .htaccess file found for assets`));
    console.log(chalk.yellow(`Recommendation: Create .htaccess file with CORS headers for Apache servers`));
  }
  
  // For Nginx, we can just provide recommendations
  console.log(chalk.blue('\nNginx CORS Configuration Tip:'));
  console.log(`If using Nginx, add this to your server block:
  location /assets {
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
    alias /path/to/assets;
  }`);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Main function
 */
function main() {
  console.log(chalk.bold.green('=== Asset Check Tool ==='));
  console.log('Checking game assets and configurations...\n');
  
  checkAssetsDirectory();
  checkCorsConfiguration();
  
  console.log(chalk.bold.green('\n=== Completion ==='));
  console.log('Asset check completed. If any issues were found, address them according to the recommendations.');
  console.log('\nDebug tips:');
  console.log('1. Make sure your asset directories match the structure expected by the game');
  console.log('2. Default assets should be in public/assets/default/');
  console.log('3. World-specific assets should be in public/assets/<world-id>/');
  console.log('4. Enable browser dev tools and check the network tab for 404 errors');
  console.log('5. Look for CORS errors in the browser console');
}

// Run the main function
main();
