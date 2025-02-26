import { createClient } from '@supabase/supabase-js'
import { css } from '@firebolt-dev/css'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export class GameHUD {
  constructor(world) {
    this.world = world
    this.container = null
    this.state = {
      inventory: [],
      currentWorld: null,
      playerStats: null
    }
    
    this.init()
  }

  async init() {
    // Create HUD container
    this.container = document.createElement('div')
    this.container.className = css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 100;
    `
    document.body.appendChild(this.container)

    // Initialize UI components
    this.createTopBar()
    this.createInventory()
    this.createWorldInfo()

    // Load initial data
    await this.loadPlayerData()
    await this.loadWorldData()

    // Subscribe to real-time updates
    this.setupRealtimeSubscriptions()
  }

  createTopBar() {
    const topBar = document.createElement('div')
    topBar.className = css`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      pointer-events: auto;
    `
    this.container.appendChild(topBar)

    // Add menu buttons
    const menuButtons = document.createElement('div')
    menuButtons.innerHTML = \`
      <button class="\${css\`
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      \`}">Inventory</button>
      <button class="\${css\`
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      \`}">Marketplace</button>
    \`
    topBar.appendChild(menuButtons)
  }

  createInventory() {
    this.inventory = document.createElement('div')
    this.inventory.className = css`
      position: absolute;
      right: 20px;
      top: 80px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 8px;
      color: white;
      display: none;
      pointer-events: auto;
    `
    this.container.appendChild(this.inventory)
  }

  createWorldInfo() {
    this.worldInfo = document.createElement('div')
    this.worldInfo.className = css`
      position: absolute;
      left: 20px;
      bottom: 20px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      padding: 15px;
      border-radius: 8px;
      color: white;
      pointer-events: auto;
    `
    this.container.appendChild(this.worldInfo)
  }

  async loadPlayerData() {
    try {
      const { data: player } = await supabase
        .from('users')
        .select('*')
        .single()
      
      if (player) {
        this.state.playerStats = player
        this.updatePlayerUI()
      }
    } catch (error) {
      console.error('Error loading player data:', error)
    }
  }

  async loadWorldData() {
    try {
      const { data: world } = await supabase
        .from('stories')
        .select('*')
        .eq('story_id', this.world.id)
        .single()
      
      if (world) {
        this.state.currentWorld = world
        this.updateWorldUI()
      }
    } catch (error) {
      console.error('Error loading world data:', error)
    }
  }

  setupRealtimeSubscriptions() {
    // Subscribe to player inventory changes
    supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace',
          filter: \`creator_id=eq.\${this.state.playerStats?.user_id}\`
        },
        (payload) => {
          this.handleInventoryUpdate(payload)
        }
      )
      .subscribe()
  }

  handleInventoryUpdate(payload) {
    // Update inventory UI based on changes
    this.loadPlayerData()
  }

  updatePlayerUI() {
    // Update UI with player stats
    if (this.state.playerStats) {
      // Update relevant UI elements
    }
  }

  updateWorldUI() {
    if (this.state.currentWorld) {
      this.worldInfo.innerHTML = \`
        <h3 class="\${css\`
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        \`}">\${this.state.currentWorld.title}</h3>
        <p class="\${css\`
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        \`}">\${this.state.currentWorld.description || ''}</p>
      \`
    }
  }

  // Public methods for world interaction
  showInventory() {
    this.inventory.style.display = 'block'
  }

  hideInventory() {
    this.inventory.style.display = 'none'
  }

  // Clean up method
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
