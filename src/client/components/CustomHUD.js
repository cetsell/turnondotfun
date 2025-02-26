import { css } from '@firebolt-dev/css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { HomeIcon, ShoppingBagIcon, UserIcon, MenuIcon } from 'lucide-react'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export function CustomHUD({ world }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()
      setUser(data)
    }
  }

  async function handleLogin() {
    const email = prompt('Email:')
    const password = prompt('Password:')
    
    if (email && password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        checkUser()
      } catch (error) {
        alert('Login failed: ' + error.message)
      }
    }
  }

  async function handleSignup() {
    const email = prompt('Email:')
    const password = prompt('Password:')
    
    if (email && password) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        alert('Check your email to confirm your account!')
      } catch (error) {
        alert('Signup failed: ' + error.message)
      }
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      alert('Logout failed: ' + error.message)
    }
  }

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={css\`
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px;
          border-radius: 4px;
          backdrop-filter: blur(10px);
          z-index: 100;
          &:hover {
            background: rgba(0, 0, 0, 0.7);
          }
        \`}
      >
        <MenuIcon size={20} />
      </button>

      {/* Menu Panel */}
      {menuOpen && (
        <div className={css\`
          position: fixed;
          top: 70px;
          left: 20px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          width: 200px;
          backdrop-filter: blur(10px);
          z-index: 100;
          color: white;
        \`}>
          {user ? (
            <>
              <div className={css\`
                padding-bottom: 12px;
                margin-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              \`}>
                <div className={css\`font-weight: 500;\`}>
                  {user.username}
                </div>
                <div className={css\`
                  font-size: 12px;
                  color: rgba(255, 255, 255, 0.5);
                \`}>
                  Online
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={css\`
                  width: 100%;
                  padding: 8px;
                  background: rgba(255, 255, 255, 0.1);
                  border: none;
                  border-radius: 4px;
                  color: white;
                  cursor: pointer;
                  &:hover {
                    background: rgba(255, 255, 255, 0.2);
                  }
                \`}
              >
                Logout
              </button>
            </>
          ) : (
            <div className={css\`
              display: flex;
              flex-direction: column;
              gap: 8px;
            \`}>
              <button
                onClick={handleLogin}
                className={css\`
                  width: 100%;
                  padding: 8px;
                  background: rgba(255, 255, 255, 0.1);
                  border: none;
                  border-radius: 4px;
                  color: white;
                  cursor: pointer;
                  &:hover {
                    background: rgba(255, 255, 255, 0.2);
                  }
                \`}
              >
                Login
              </button>
              <button
                onClick={handleSignup}
                className={css\`
                  width: 100%;
                  padding: 8px;
                  background: rgba(255, 255, 255, 0.1);
                  border: none;
                  border-radius: 4px;
                  color: white;
                  cursor: pointer;
                  &:hover {
                    background: rgba(255, 255, 255, 0.2);
                  }
                \`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className={css\`
        position: fixed;
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
        z-index: 100;
      \`}>
        <button
          onClick={() => world.localPlayer.teleport([0, 0, 0])}
          className={css\`
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          \`}
        >
          <HomeIcon size={16} />
          <span>Home</span>
        </button>
        <button
          onClick={() => alert('Inventory coming soon!')}
          className={css\`
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          \`}
        >
          <ShoppingBagIcon size={16} />
          <span>Inventory</span>
        </button>
        <button
          onClick={() => alert('Profile coming soon!')}
          className={css\`
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          \`}
        >
          <UserIcon size={16} />
          <span>Profile</span>
        </button>
      </div>
    </>
  )
}
