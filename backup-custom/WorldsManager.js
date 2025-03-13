import { createServerWorld } from '../core/createServerWorld'

/**
 * Manages multiple world instances and their connections
 */
export class WorldsManager {
  constructor() {
    this.worlds = new Map()
    this.defaultWorld = null
    this.clientWorlds = new Map() // Maps clientId to worldId
    this.sockets = new Map() // All active sockets
    this.time = 0
    this._lastTime = Date.now()
    this._updateInterval = null
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
    
    // Create a default world
    const defaultWorld = await this.createWorld('default', options)
    this.defaultWorld = defaultWorld
    
    // Start update loop
    this._startUpdateLoop()
    
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
      
      // Create a new server world
      const world = createServerWorld()
      
      // Initialize the world with the provided options
      console.log(`WorldsManager: Initializing world ${worldId} with options:`, {
        hasDB: !!options.db,
        worldId: worldId
      })
      
      const worldOptions = {
        ...options,
        worldId: worldId // Ensure worldId is passed to the world
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
      console.log(`WorldsManager: World ${worldId} not found, creating it`)
      
      try {
        world = await this.createWorld(worldId, this.options)
      } catch (error) {
        console.error(`WorldsManager: Failed to create world ${worldId}:`, error)
        return null
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
   * @param {Object} user - User object
   * @param {string} worldId - World ID
   */
  async handleConnection(ws, authToken, user, worldId = 'default') {
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
      
      // Add a close handler to clean up
      ws.on('close', (code, reason) => {
        console.log(`WorldsManager: Client ${clientId} disconnected from world ${worldId}. Code: ${code}, Reason: ${reason || 'No reason provided'}`)
        this.sockets.delete(clientId)
        this.clientWorlds.delete(clientId)
      })
      
      // Add an error handler
      ws.on('error', (error) => {
        console.error(`WorldsManager: Error in client ${clientId} connection:`, error)
      })
      
      // Pass the connection to the world
      if (world.network && typeof world.network.onConnection === 'function') {
        world.network.onConnection(ws, authToken, user)
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
   * Start the update loop for all worlds
   * @private
   */
  _startUpdateLoop() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval)
    }
    
    this._updateInterval = setInterval(() => {
      const now = Date.now()
      const delta = (now - this._lastTime) / 1000
      this._lastTime = now
      
      this.time += delta
      
      // Update all worlds
      for (const [id, world] of this.worlds) {
        try {
          if (world.update) {
            world.update(delta)
          }
        } catch (error) {
          console.error(`Error updating world ${id}:`, error)
        }
      }
    }, 16) // ~60fps
  }
  
  /**
   * Shutdown all worlds and clean up resources
   */
  shutdown() {
    console.log('WorldsManager: Shutting down')
    
    if (this._updateInterval) {
      clearInterval(this._updateInterval)
    }
    
    // Close all sockets
    for (const ws of this.sockets.values()) {
      try {
        ws.close(1000, 'Server shutting down')
      } catch (error) {
        console.error('Error closing socket:', error)
      }
    }
    
    // Clear collections
    this.sockets.clear()
    this.clientWorlds.clear()
    
    // Shutdown all worlds
    for (const [id, world] of this.worlds) {
      try {
        if (world.shutdown) {
          world.shutdown()
        }
      } catch (error) {
        console.error(`Error shutting down world ${id}:`, error)
      }
    }
    
    this.worlds.clear()
    this.defaultWorld = null
  }
}
