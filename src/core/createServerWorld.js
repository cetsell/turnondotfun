import { World } from './World.js'

import { Server } from './systems/Server.js'
import { ServerNetwork } from './systems/ServerNetwork.js'
import { ServerLoader } from './systems/ServerLoader.js'

export function createServerWorld() {
  const world = new World()
  world.register('server', Server)
  world.register('network', ServerNetwork)
  world.register('loader', ServerLoader)
  return world
}
