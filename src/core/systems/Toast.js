import { System } from './System'

export class Toast extends System {
  constructor(world) {
    super(world)
  }

  async init() {
    console.log('Toast system: Initializing')
  }

  start() {
    console.log('Toast system: Starting')
  }

  preTick() {}
  
  preFixedUpdate() {}
  
  fixedUpdate() {}
  
  postFixedUpdate() {}
  
  preUpdate() {}
  
  update() {}
  
  postUpdate() {}
  
  lateUpdate() {}
  
  postLateUpdate() {}
  
  commit() {}
  
  postTick() {}

  show(text) {
    console.log('Toast system: Showing', text)
    this.world.emit('toast', text)
  }
}
