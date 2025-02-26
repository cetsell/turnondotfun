import { GameHUD } from '../components/GameHUD'

export class WorldPlugin {
  constructor(world) {
    this.world = world
    this.hud = null
  }

  async init() {
    // Initialize the HUD
    this.hud = new GameHUD(this.world)

    // Listen for player join events
    this.world.onPlayerJoin(player => {
      this.handlePlayerJoin(player)
    })

    // Listen for player leave events
    this.world.onPlayerLeave(player => {
      this.handlePlayerLeave(player)
    })
  }

  handlePlayerJoin(player) {
    // You can add custom behavior when a player joins
    console.log('Player joined:', player)
  }

  handlePlayerLeave(player) {
    // Clean up any player-specific resources
    console.log('Player left:', player)
  }

  // Add custom commands that players can use
  registerCommands() {
    this.world.commands.add({
      name: 'inventory',
      description: 'Show your inventory',
      execute: (player) => {
        this.hud.showInventory()
      }
    })

    this.world.commands.add({
      name: 'marketplace',
      description: 'Open the marketplace',
      execute: (player) => {
        // Open marketplace in a new window/tab
        window.open('/marketplace', '_blank')
      }
    })
  }

  // Clean up when the plugin is destroyed
  destroy() {
    if (this.hud) {
      this.hud.destroy()
    }
  }
}
