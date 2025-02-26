import { GameHUD } from '../../client/components/GameHUD'
import { createClient } from '@supabase/supabase-js'

export class MarketplaceSystem {
  constructor(world) {
    this.world = world
    this.hud = null
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  async init() {
    // Only run client-side code in the browser
    if (typeof window !== 'undefined') {
      console.log('MarketplaceSystem: Initializing')
      
      // Register chat commands
      this.world.chat.registerCommand({
        name: 'shop',
        description: 'Open the marketplace',
        handler: () => {
          this.openMarketplace()
        }
      })

      // Register M key to toggle marketplace
      const control = this.world.controls.bind({ priority: 1 })
      control.keyM.onPress = () => {
        this.openMarketplace()
      }

      console.log('MarketplaceSystem: Initialized')
    }
  }

  openMarketplace() {
    console.log('MarketplaceSystem: Opening marketplace')
    this.world.toast.show('Marketplace coming soon!')
  }

  setupEventListeners() {
    // Listen for real-time updates from Supabase
    this.supabase
      .channel('marketplace_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace'
        },
        (payload) => {
          console.log('Marketplace update:', payload)
          // TODO: Update UI when marketplace changes
        }
      )
      .subscribe()

    // Handle player interactions
    this.world.events.on('player:interact', (event) => {
      if (event.target && event.target.marketplaceItem) {
        this.handleItemInteraction(event)
      }
    })
  }

  async handleMarketplaceUpdate(payload) {
    // Update HUD and world state based on marketplace changes
    if (this.hud) {
      await this.hud.loadPlayerData()
    }

    // Emit event for other systems
    this.world.emit('marketplace:update', payload)
  }

  async handleItemInteraction(event) {
    const { player, target } = event
    const itemId = target.marketplaceItem

    try {
      // Fetch item details
      const { data: item } = await this.supabase
        .from('marketplace')
        .select('*')
        .eq('listing_id', itemId)
        .single()

      if (item) {
        // Show item details in HUD
        this.hud?.showItemDetails(item)
      }
    } catch (error) {
      console.error('Error fetching item details:', error)
    }
  }

  // Add marketplace item to the 3D world
  addMarketplaceItem(position, itemData) {
    const entity = this.world.entities.create({
      position,
      marketplaceItem: itemData.listing_id, // Add custom property
      // Add any other entity properties
    })

    // Add visual representation
    const mesh = this.createItemMesh(itemData)
    entity.add(mesh)

    return entity
  }

  createItemMesh(itemData) {
    // Create a visual representation of the marketplace item
    // This is just an example - customize based on your needs
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: 0x6d28d9, // Purple color
      metalness: 0.5,
      roughness: 0.5
    })
    return new THREE.Mesh(geometry, material)
  }

  destroy() {
    if (this.hud) {
      this.hud.destroy()
    }
  }
}
