import { createServerWorld } from '../core/createServerWorld.js'
import fs from 'fs-extra'
import path from 'path'

/**
 * Manages multiple world instances and their connections
 * Updated for Hyperfy 0.9.0
 */
export class WorldsManager {
  constructor(rootDir) {
    this.worlds = new Map()
    this.defaultWorld = null
    this.clientWorlds = new Map() // Maps clientId to worldId
    this.sockets = new Map() // All active sockets
    this.time = 0
    this._lastTime = Date.now()
    this._updateInterval = null
    this.rootDir = rootDir
    this.supabase = null
    this.predefinedWorlds = new Set(['default']) // List of predefined worlds
  }

  /**
   * Initialize the WorldsManager
   * @param {Object} options - Options for initialization
   * @param {Object} options.db - Database instance
   * @param {Function} options.loadPhysX - Function to load PhysX
   */
  async init(options) {
    console.log('WorldsManager: Initializing with default world')
    this.options = options
    
    // Initialize Supabase client
    try {
      const { createClient } = await import('@supabase/supabase-js')
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      )
      console.log('WorldsManager: Supabase client initialized')
      
      // Create worlds table if it doesn't exist
      await this._ensureWorldsTable()
      
      // Check if game_Sessions table exists (we won't create it as it already exists)
      await this._checkGameSessionsTable()
    } catch (error) {
      console.error('WorldsManager: Failed to initialize Supabase client:', error)
      // We'll continue without Supabase integration if it fails
    }
    
    // Create a default world
    const defaultWorld = await this.createWorld('default', options)
    this.defaultWorld = defaultWorld
    
    // Start update loop
    this._startUpdateLoop()
    
    // Load existing worlds from Supabase if available
    if (this.supabase) {
      try {
        await this._loadPredefinedWorlds()
      } catch (error) {
        console.error('WorldsManager: Error loading predefined worlds:', error)
      }
    }
    
    console.log(`WorldsManager: Initialization complete, worlds: ${Array.from(this.worlds.keys()).join(', ')}`)
    return this
  }

  /**
   * Create a new world instance
   * @param {string} worldId - Unique identifier for the world
   * @param {Object} options - Options for the world
   * @returns {Object} The created world instance
   */
  async createWorld(worldId, options = this.options) {
    console.log(`WorldsManager: Creating world ${worldId}`)
    
    if (this.worlds.has(worldId)) {
      console.log(`WorldsManager: World ${worldId} already exists, returning existing instance`)
      return this.worlds.get(worldId)
    }
    
    try {
      // Ensure we have valid options
      if (!options) {
        console.error(`WorldsManager: No options provided for world ${worldId}`)
        throw new Error('No world initialization options provided')
      }
      
      // Create the world directory structure if it doesn't exist
      const worldDir = path.join(this.rootDir, `worlds/${worldId}`)
      const worldAssetsDir = path.join(worldDir, 'assets')
      
      await fs.ensureDir(worldDir)
      await fs.ensureDir(worldAssetsDir)
      
      // Copy core assets if this is a new world
      const coreAssetsDir = path.join(this.rootDir, 'src/core/assets')
      if (await fs.pathExists(coreAssetsDir)) {
        await fs.copy(coreAssetsDir, worldAssetsDir, { overwrite: false })
      }
      
      // Create a new server world
      const world = createServerWorld()
      
      // Check if world exists in Supabase
      let worldData = null
      if (this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('worlds')
            .select('*')
            .eq('id', worldId)
            .single()
          
          if (!error && data) {
            worldData = data
            console.log(`WorldsManager: Found existing world data in Supabase for ${worldId}`)
            
            // Add to predefined worlds if it's not already there
            if (!this.predefinedWorlds.has(worldId)) {
              this.predefinedWorlds.add(worldId)
            }
          }
        } catch (error) {
          console.error(`WorldsManager: Error checking world in Supabase: ${worldId}`, error)
        }
      }
      
      // Create storage for the world
      const storage = new (options.Storage || Object)(path.join(worldDir, '/storage.json'))
      
      // Initialize the world with the provided options
      console.log(`WorldsManager: Initializing world ${worldId} with options:`, {
        hasDB: !!options.db,
        worldId: worldId,
        hasSupabase: !!this.supabase
      })
      
      const worldOptions = {
        ...options,
        worldId: worldId, // Ensure worldId is passed to the world
        worldDir,
        assetsDir: worldAssetsDir,
        storage, // Pass storage to the world
        worldData // Pass world data from Supabase if available
      }
      
      await world.init(worldOptions)
      
      // Store the world in the map
      this.worlds.set(worldId, world)
      
      console.log(`WorldsManager: World ${worldId} created successfully`)
      
      return world
    } catch (error) {
      console.error(`WorldsManager: Error creating world ${worldId}:`, error)
      throw error
    }
  }

  /**
   * Get a world instance by ID, creating it if it doesn't exist
   * @param {string} worldId - Unique identifier for the world
   * @returns {Promise<Object>} The world instance
   */
  async getOrCreateWorld(worldId) {
    if (!worldId || worldId === 'default') {
      return this.defaultWorld || this.worlds.get('default')
    }
    
    let world = this.worlds.get(worldId)
    if (!world) {
      // Check if this is a predefined world
      if (this.predefinedWorlds.has(worldId)) {
        console.log(`WorldsManager: Loading predefined world ${worldId}`)
        try {
          world = await this.createWorld(worldId, this.options)
        } catch (error) {
          console.error(`WorldsManager: Failed to load predefined world ${worldId}:`, error)
          return null
        }
      } else {
        console.log(`WorldsManager: World ${worldId} is not a predefined world, using default`)
        return this.defaultWorld || this.worlds.get('default')
      }
    }
    return world
  }

  /**
   * Get a world instance by ID
   * @param {string} worldId - Unique identifier for the world
   * @returns {Object|null} The world instance or null if not found
   */
  getWorld(worldId) {
    if (!worldId || worldId === 'default') {
      return this.defaultWorld || this.worlds.get('default')
    }
    return this.worlds.get(worldId) || null
  }

  /**
   * Handle a WebSocket connection for a specific world
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} authToken - Authentication token
   * @param {string} worldId - World ID
   */
  async handleConnection(ws, authToken, worldId = 'default') {
    console.log(`WorldsManager: Handling connection for world ${worldId}`)
    
    // Generate a unique client ID for this connection
    const clientId = `${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
    ws.clientId = clientId
    
    // Store which world this client is connected to
    this.clientWorlds.set(clientId, worldId)
    
    // Get or create the world
    const world = await this.getOrCreateWorld(worldId)
    
    if (!world) {
      console.error(`WorldsManager: World ${worldId} could not be created or accessed, connection rejected`)
      ws.close(1011, `World ${worldId} not found or could not be created`)
      return
    }
    
    try {
      console.log(`WorldsManager: Establishing connection for world ${worldId}`)
      
      // Store the socket in our global map
      this.sockets.set(clientId, ws)
      
      // Extract user information from auth token
      let userId = null
      if (authToken && this.supabase) {
        try {
          const { data, error } = await this.supabase.auth.getUser(authToken)
          if (!error && data.user) {
            userId = data.user.id
          }
        } catch (error) {
          console.error('Error getting user from auth token:', error)
        }
      }
      
      // Record game session in Supabase if available
      if (this.supabase && userId) {
        try {
          await this.recordGameSession(userId, worldId, clientId)
        } catch (error) {
          console.error(`WorldsManager: Error recording game session:`, error)
          // Continue anyway, this is not critical
        }
      }
      
      // Add a close handler to clean up
      ws.on('close', async (code, reason) => {
        console.log(`WorldsManager: Client ${clientId} disconnected from world ${worldId}. Code: ${code}, Reason: ${reason || 'No reason provided'}`)
        this.sockets.delete(clientId)
        this.clientWorlds.delete(clientId)
        
        // Update game session end time
        if (this.supabase && userId) {
          try {
            await this.updateGameSessionEnd(clientId)
          } catch (error) {
            console.error(`WorldsManager: Error updating game session end time:`, error)
          }
        }
      })
      
      // Add an error handler
      ws.on('error', (error) => {
        console.error(`WorldsManager: Error in client ${clientId} connection:`, error)
      })
      
      // Pass the connection to the world
      if (world.network && typeof world.network.onConnection === 'function') {
        world.network.onConnection(ws, authToken)
        console.log(`WorldsManager: Connection established for world ${worldId}`)
      } else {
        console.error(`WorldsManager: World ${worldId} has no network.onConnection method`)
        ws.close(1011, 'Server configuration error')
      }
    } catch (error) {
      console.error(`WorldsManager: Error handling connection for world ${worldId}:`, error)
      ws.close(1011, 'Server error')
    }
  }
  
  /**
   * Record a new game session in Supabase
   * @param {string} userId - User ID
   * @param {string} worldId - World ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} The created session
   */
  async recordGameSession(userId, worldId, clientId) {
    if (!this.supabase) return null
    
    try {
      // Adapt this to match your existing game_Sessions table structure
      const { data, error } = await this.supabase
        .from('game_Sessions')
        .insert({
          user_id: userId,
          world_id: worldId,
          client_id: clientId,
          start_time: new Date().toISOString(),
          is_active: true
          // Add any other required fields for your existing table
        })
        .select()
        .single()
      
      if (error) {
        console.error(`WorldsManager: Error recording game session:`, error)
        return null
      }
      
      console.log(`WorldsManager: Recorded game session for user ${userId} in world ${worldId}`)
      return data
    } catch (error) {
      console.error(`WorldsManager: Error recording game session:`, error)
      return null
    }
  }
  
  /**
   * Update game session end time
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} The updated session
   */
  async updateGameSessionEnd(clientId) {
    if (!this.supabase) return null
    
    try {
      // Adapt this to match your existing game_Sessions table structure
      const { data, error } = await this.supabase
        .from('game_Sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false
          // Update any other fields that need to be updated when a session ends
        })
        .eq('client_id', clientId)
        .select()
        .single()
      
      if (error) {
        console.error(`WorldsManager: Error updating game session end time:`, error)
        return null
      }
      
      console.log(`WorldsManager: Updated game session end time for client ${clientId}`)
      return data
    } catch (error) {
      console.error(`WorldsManager: Error updating game session end time:`, error)
      return null
    }
  }
  
  /**
   * Start the update loop for all worlds
   * @private
   */
  _startUpdateLoop() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval)
    }
    
    this._updateInterval = setInterval(() => {
      const now = Date.now()
      const dt = (now - this._lastTime) / 1000
      this._lastTime = now
      this.time += dt
      
      for (const world of this.worlds.values()) {
        if (world.tick) {
          world.tick(this.time)
        }
      }
    }, 1000 / 60) // 60 FPS
  }
  
  /**
   * Shutdown all worlds and clean up resources
   */
  async shutdown() {
    console.log('WorldsManager: Shutting down')
    
    if (this._updateInterval) {
      clearInterval(this._updateInterval)
      this._updateInterval = null
    }
    
    // Close all sockets
    for (const [clientId, socket] of this.sockets.entries()) {
      try {
        socket.close(1001, 'Server shutting down')
      } catch (error) {
        console.error(`WorldsManager: Error closing socket ${clientId}:`, error)
      }
    }
    
    // Clear maps
    this.sockets.clear()
    this.clientWorlds.clear()
    
    // Shutdown all worlds
    for (const [worldId, world] of this.worlds.entries()) {
      try {
        if (world.shutdown) {
          await world.shutdown()
        }
      } catch (error) {
        console.error(`WorldsManager: Error shutting down world ${worldId}:`, error)
      }
    }
    
    this.worlds.clear()
    this.defaultWorld = null
    
    console.log('WorldsManager: Shutdown complete')
  }
  
  /**
   * List all available worlds
   * @returns {Array} Array of world objects with id and name
   */
  async listWorlds() {
    const worlds = []
    
    // If Supabase is available, get worlds from there
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('worlds')
          .select('id, title, description, is_public, created_at, updated_at, created_by')
        
        if (!error && data) {
          // Map Supabase data to our format and add active status
          worlds.push(...data.map(world => ({
            id: world.id,
            name: world.title || world.id,
            description: world.description,
            isPublic: world.is_public,
            createdBy: world.created_by,
            createdAt: world.created_at,
            updatedAt: world.updated_at,
            active: this.worlds.has(world.id),
            isPredefined: this.predefinedWorlds.has(world.id)
          })))
          
          // We've got all worlds from Supabase, so return early
          return worlds
        }
      } catch (error) {
        console.error('Error fetching worlds from Supabase:', error)
        // Fall back to file system if Supabase fails
      }
    }
    
    // Add all in-memory worlds
    for (const [id, world] of this.worlds.entries()) {
      worlds.push({
        id,
        name: world.name || id,
        active: true,
        isPredefined: this.predefinedWorlds.has(id)
      })
    }
    
    return worlds
  }
  
  /**
   * Remove a world from memory
   * @param {string} worldId - World ID to remove
   */
  removeWorld(worldId) {
    if (worldId === 'default') {
      console.warn('WorldsManager: Cannot remove the default world')
      return false
    }
    
    const world = this.worlds.get(worldId)
    if (!world) {
      console.warn(`WorldsManager: World ${worldId} not found, cannot remove`)
      return false
    }
    
    // Close all connections to this world
    for (const [clientId, currentWorldId] of this.clientWorlds.entries()) {
      if (currentWorldId === worldId) {
        const socket = this.sockets.get(clientId)
        if (socket) {
          try {
            socket.close(1000, 'World is being removed')
          } catch (error) {
            console.error(`WorldsManager: Error closing socket ${clientId}:`, error)
          }
        }
        this.sockets.delete(clientId)
        this.clientWorlds.delete(clientId)
      }
    }
    
    // Shutdown the world
    if (world.shutdown) {
      try {
        world.shutdown()
      } catch (error) {
        console.error(`WorldsManager: Error shutting down world ${worldId}:`, error)
      }
    }
    
    // Remove from the worlds map
    this.worlds.delete(worldId)
    
    console.log(`WorldsManager: Removed world ${worldId}`)
    return true
  }
  
  /**
   * Ensure the worlds table exists in Supabase
   * @private
   */
  async _ensureWorldsTable() {
    if (!this.supabase) return
    
    try {
      // Check if the worlds table exists
      const { error } = await this.supabase
        .from('worlds')
        .select('id')
        .limit(1)
      
      if (error) {
        console.warn('WorldsManager: Worlds table may not exist in Supabase:', error.message)
        // If using REST API we can't create tables, so we'll just log a warning
      }
    } catch (error) {
      console.error('WorldsManager: Error checking worlds table:', error)
    }
  }
  
  /**
   * Check if game_Sessions table exists in Supabase
   * @private
   */
  async _checkGameSessionsTable() {
    if (!this.supabase) return
    
    try {
      // Check if the game_Sessions table exists
      const { error } = await this.supabase
        .from('game_Sessions')
        .select('id')
        .limit(1)
      
      if (error) {
        console.warn('WorldsManager: game_Sessions table may not exist in Supabase:', error.message)
        // If using REST API we can't create tables, so we'll just log a warning
      }
    } catch (error) {
      console.error('WorldsManager: Error checking game_Sessions table:', error)
    }
  }
  
  /**
   * Load predefined worlds from Supabase
   * @private
   */
  async _loadPredefinedWorlds() {
    if (!this.supabase) return
    
    try {
      const { data, error } = await this.supabase
        .from('worlds')
        .select('id, title, is_public')
        .eq('is_public', true)
      
      if (error) {
        console.error('WorldsManager: Error fetching worlds from Supabase:', error)
        return
      }
      
      if (!data || data.length === 0) {
        console.log('WorldsManager: No predefined worlds found in Supabase')
        return
      }
      
      console.log(`WorldsManager: Found ${data.length} predefined worlds in Supabase`)
      
      // Add these to our predefined worlds set
      for (const world of data) {
        if (world.id === 'default') continue // Already loaded
        
        this.predefinedWorlds.add(world.id)
        console.log(`WorldsManager: Added predefined world: ${world.id} (${world.title || 'Untitled'})`)
      }
      
      // Only preload the default world, others will be loaded on demand
      // This improves startup time
    } catch (error) {
      console.error('WorldsManager: Error loading predefined worlds:', error)
    }
  }
}
