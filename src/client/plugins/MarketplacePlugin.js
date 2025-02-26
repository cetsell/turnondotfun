import { css } from '@firebolt-dev/css'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export class MarketplacePlugin {
  constructor(world) {
    this.world = world
    this.init()
  }

  init() {
    // Add menu button to GUI
    const button = document.createElement('button')
    button.className = css\`
      position: fixed;
      top: 20px;
      left: 20px;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      z-index: 1000;
      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    \`
    button.textContent = 'Menu'
    button.onclick = () => {
      alert('Menu clicked!')
    }
    document.body.appendChild(button)
  }
}
