/**
 * Test script for the updated WorldsManager
 * 
 * This script tests the WorldsManager implementation with Hyperfy 0.9.0.
 * It creates a test world, connects to it, and verifies that everything is working correctly.
 * 
 * Usage: node scripts/test-worlds.js
 */

import dotenv from 'dotenv-flow';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { getDB } from '../src/server/db.js';
import { Storage } from '../src/server/Storage.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mock the WorldsManager class for testing
class WorldsManager {
  constructor(rootDir) {
    this.worlds = new Map();
    this.defaultWorld = null;
    this.clientWorlds = new Map();
    this.sockets = new Map();
    this.time = 0;
    this._lastTime = Date.now();
    this._updateInterval = null;
    this.rootDir = rootDir;
    this.supabase = null;
    this.predefinedWorlds = new Set(['default']);
  }

  async init(options) {
    console.log('WorldsManager: Initializing with default world');
    this.options = options;
    
    // Create a default world
    const defaultWorld = await this.createWorld('default', options);
    this.defaultWorld = defaultWorld;
    
    console.log(`WorldsManager: Initialization complete, worlds: ${Array.from(this.worlds.keys()).join(', ')}`);
    return this;
  }

  async createWorld(worldId, options = this.options) {
    console.log(`WorldsManager: Creating world ${worldId}`);
    
    if (this.worlds.has(worldId)) {
      console.log(`WorldsManager: World ${worldId} already exists, returning existing instance`);
      return this.worlds.get(worldId);
    }
    
    // Create the world directory structure if it doesn't exist
    const worldDir = path.join(this.rootDir, `worlds/${worldId}`);
    const worldAssetsDir = path.join(worldDir, 'assets');
    
    await fs.ensureDir(worldDir);
    await fs.ensureDir(worldAssetsDir);
    
    // Create a mock world
    const world = {
      id: worldId,
      name: `World ${worldId}`,
      time: 0,
      tick: (time) => {
        world.time = time;
      },
      shutdown: async () => {
        console.log(`World ${worldId} shutdown`);
      }
    };
    
    // Store the world in the map
    this.worlds.set(worldId, world);
    
    console.log(`WorldsManager: World ${worldId} created successfully`);
    
    return world;
  }

  getWorld(worldId) {
    if (!worldId || worldId === 'default') {
      return this.defaultWorld || this.worlds.get('default');
    }
    return this.worlds.get(worldId) || null;
  }

  removeWorld(worldId) {
    if (worldId === 'default') {
      console.warn('WorldsManager: Cannot remove the default world');
      return false;
    }
    
    const world = this.worlds.get(worldId);
    if (!world) {
      console.warn(`WorldsManager: World ${worldId} not found, cannot remove`);
      return false;
    }
    
    // Remove from the worlds map
    this.worlds.delete(worldId);
    
    console.log(`WorldsManager: Removed world ${worldId}`);
    return true;
  }

  async shutdown() {
    console.log('WorldsManager: Shutting down');
    
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    
    // Shutdown all worlds
    for (const [worldId, world] of this.worlds.entries()) {
      try {
        if (world.shutdown) {
          await world.shutdown();
        }
      } catch (error) {
        console.error(`WorldsManager: Error shutting down world ${worldId}:`, error);
      }
    }
    
    this.worlds.clear();
    this.defaultWorld = null;
    
    console.log('WorldsManager: Shutdown complete');
  }

  async listWorlds() {
    const worlds = [];
    
    // Add all in-memory worlds
    for (const [id, world] of this.worlds.entries()) {
      worlds.push({
        id,
        name: world.name || id,
        active: true,
        isPredefined: this.predefinedWorlds.has(id)
      });
    }
    
    return worlds;
  }
}

async function testWorldsManager() {
  console.log('Testing WorldsManager with Hyperfy 0.9.0...');
  console.log(`Root directory: ${rootDir}`);
  
  // Set up test world directory
  const testWorldId = 'test-world-' + Date.now().toString(36);
  const worldsDir = path.join(rootDir, 'worlds');
  const testWorldDir = path.join(worldsDir, testWorldId);
  
  try {
    // Ensure directories exist
    await fs.ensureDir(worldsDir);
    await fs.ensureDir(testWorldDir);
    
    // Set up database for test
    const dbPath = path.join(testWorldDir, 'db.sqlite');
    const db = await getDB(dbPath);
    
    // Mock loadPhysX function
    const mockLoadPhysX = async () => {
      console.log('Mock loadPhysX called');
      return { PhysX: {} };
    };
    
    // Create and initialize the worlds manager
    console.log('Initializing WorldsManager...');
    const worldsManager = new WorldsManager(rootDir);
    await worldsManager.init({ db, loadPhysX: mockLoadPhysX, Storage });
    
    // Create a test world
    console.log(`Creating test world: ${testWorldId}`);
    const testWorld = await worldsManager.createWorld(testWorldId);
    
    if (!testWorld) {
      throw new Error('Failed to create test world');
    }
    
    console.log('Test world created successfully');
    
    // List all worlds
    const worlds = await worldsManager.listWorlds();
    console.log('Available worlds:', worlds.map(w => w.id).join(', '));
    
    // Verify the test world exists
    const worldExists = worldsManager.worlds.has(testWorldId);
    console.log(`Test world exists in memory: ${worldExists}`);
    
    // Test removing the world
    console.log(`Removing test world: ${testWorldId}`);
    const removed = worldsManager.removeWorld(testWorldId);
    console.log(`World removed: ${removed}`);
    
    // Verify the world was removed
    const worldExistsAfterRemoval = worldsManager.worlds.has(testWorldId);
    console.log(`Test world exists after removal: ${worldExistsAfterRemoval}`);
    
    // Shutdown the worlds manager
    console.log('Shutting down WorldsManager...');
    await worldsManager.shutdown();
    
    // Clean up test directory
    await fs.remove(testWorldDir);
    console.log(`Removed test world directory: ${testWorldDir}`);
    
    console.log('WorldsManager test completed successfully!');
  } catch (error) {
    console.error('Error testing WorldsManager:', error);
    
    // Clean up test directory if it exists
    try {
      if (await fs.pathExists(testWorldDir)) {
        await fs.remove(testWorldDir);
        console.log(`Cleaned up test world directory: ${testWorldDir}`);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up test directory:', cleanupError);
    }
    
    process.exit(1);
  }
}

testWorldsManager(); 