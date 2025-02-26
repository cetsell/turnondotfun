import { css } from '@firebolt-dev/css'
import { createClient } from '@supabase/supabase-js'

export class WorldHUD {
  constructor(world) {
    this.world = world
    this.container = null
    this.menuOpen = false
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )
    this.init()
  }

  init() {
    // Create HUD container
    this.container = document.createElement('div')
    this.container.className = css\`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 100;

      /* All buttons share these styles */
      button {
        pointer-events: auto;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.2s;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
          border-color: rgba(255, 255, 255, 0.2);
        }
      }
    \`
    document.body.appendChild(this.container)

    // Add menu button
    const menuBtn = document.createElement('button')
    menuBtn.className = css\`
      position: absolute;
      top: 20px;
      left: 20px;
    \`
    menuBtn.textContent = '☰ Menu'
    menuBtn.onclick = () => this.toggleMenu()
    this.container.appendChild(menuBtn)

    // Create menu panel (hidden by default)
    this.menuPanel = document.createElement('div')
    this.menuPanel.className = css\`
      position: absolute;
      top: 70px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 16px;
      width: 200px;
      display: none;
      pointer-events: auto;
      backdrop-filter: blur(10px);
    \`
    this.container.appendChild(this.menuPanel)

    // Add quick actions bar
    const actionsBar = document.createElement('div')
    actionsBar.className = css\`
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    \`
    
    // Add some quick action buttons
    const actions = [
      { label: '🏠 Home', action: () => this.world.localPlayer.teleport([0, 0, 0]) },
      { label: '🎒 Inventory', action: () => this.toggleInventory() },
      { label: '💰 Shop', action: () => this.toggleShop() },
      { label: '👥 Social', action: () => this.toggleSocial() }
    ]

    actions.forEach(({ label, action }) => {
      const btn = document.createElement('button')
      btn.textContent = label
      btn.onclick = action
      actionsBar.appendChild(btn)
    })

    this.container.appendChild(actionsBar)

    // Update menu content
    this.updateMenu()
  }

  async updateMenu() {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    this.menuPanel.innerHTML = \`
      <div class="\${css\`
        color: white;
        display: flex;
        flex-direction: column;
        gap: 12px;
      \`}">
        ${session?.user ? \`
          <div class="\${css\`
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          \`}">
            <div class="\${css\`font-weight: 500;\`}">
              ${session.user.email}
            </div>
            <div class="\${css\`
              font-size: 12px;
              color: rgba(255, 255, 255, 0.5);
            \`}">
              Online
            </div>
          </div>
          <button onclick="window.hud.logout()">
            Logout
          </button>
        \` : \`
          <button onclick="window.hud.login()">
            Login
          </button>
          <button onclick="window.hud.signup()">
            Sign Up
          </button>
        \`}
      </div>
    \`
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen
    this.menuPanel.style.display = this.menuOpen ? 'block' : 'none'
  }

  async login() {
    const email = prompt('Email:')
    const password = prompt('Password:')
    
    if (email && password) {
      try {
        const { error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        this.updateMenu()
        alert('Logged in successfully!')
      } catch (error) {
        alert('Login failed: ' + error.message)
      }
    }
  }

  async signup() {
    const email = prompt('Email:')
    const password = prompt('Password:')
    
    if (email && password) {
      try {
        const { error } = await this.supabase.auth.signUp({
          email,
          password
        })
        
        if (error) throw error
        
        this.updateMenu()
        alert('Signed up successfully! Please check your email to confirm your account.')
      } catch (error) {
        alert('Signup failed: ' + error.message)
      }
    }
  }

  async logout() {
    try {
      await this.supabase.auth.signOut()
      this.updateMenu()
      alert('Logged out successfully!')
    } catch (error) {
      alert('Logout failed: ' + error.message)
    }
  }

  toggleInventory() {
    // TODO: Implement inventory panel
    alert('Inventory coming soon!')
  }

  toggleShop() {
    // TODO: Implement shop panel
    alert('Shop coming soon!')
  }

  toggleSocial() {
    // TODO: Implement social panel
    alert('Social features coming soon!')
  }
}
