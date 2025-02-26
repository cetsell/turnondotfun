import { MarketplaceSystem } from '../src/core/systems/MarketplaceSystem'

export default {
  name: 'MyWorld',
  description: 'An interactive marketplace world',

  async init(world) {
    console.log('World init started')
    
    // Register marketplace system
    world.register('marketplace', MarketplaceSystem)
    console.log('Registered marketplace system')
    
    // Set up environment
    world.environment = {
      skybox: 'asset://day2.hdr',
      fog: {
        color: '#1a1a1a',
        near: 10,
        far: 100
      }
    }
    console.log('Environment setup complete')

    // Set up lighting
    world.entities.create({
      light: {
        type: 'ambient',
        intensity: 0.5,
        color: '#ffffff'
      }
    })
    console.log('Ambient light created')

    world.entities.create({
      light: {
        type: 'directional',
        intensity: 1,
        color: '#ffffff',
        position: { x: 10, y: 20, z: 10 }
      }
    })
    console.log('Directional light created')

    // Listen for ready event
    world.on('ready', () => {
      console.log('World ready event fired')
    })

    console.log('World init complete')
  },

  tick(world, dt) {
    // Add any per-frame updates here
  }
}