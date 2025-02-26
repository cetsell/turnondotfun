import { css } from '@firebolt-dev/css'
import { supabase } from '../lib/supabase'

export class LoginModal {
  constructor() {
    this.container = null
    this.visible = false
    this.supabase = supabase
    
    this.init()
  }

  init() {
    // Create modal container
    this.container = document.createElement('div')
    this.container.className = css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: none;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 1000;
    `

    // Create modal content with proper escaping of template literals
    this.container.innerHTML = `
      <div class="${css`
        background: #1a1a1a;
        padding: 2rem;
        border-radius: 0.5rem;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      `}">
        <h2 class="${css`
          color: white;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        `}">Login or Sign Up</h2>

        <form id="authForm" class="${css`
          display: flex;
          flex-direction: column;
          gap: 1rem;
        `}">
          <input 
            type="email" 
            id="email" 
            placeholder="Email"
            class="${css`
              padding: 0.75rem;
              border-radius: 0.25rem;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              color: white;
              &:focus {
                outline: none;
                border-color: #6d28d9;
              }
            `}"
          />
          <input 
            type="password" 
            id="password" 
            placeholder="Password"
            class="${css`
              padding: 0.75rem;
              border-radius: 0.25rem;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              color: white;
              &:focus {
                outline: none;
                border-color: #6d28d9;
              }
            `}"
          />
          <button 
            type="submit"
            class="${css`
              padding: 0.75rem;
              border-radius: 0.25rem;
              background: #6d28d9;
              color: white;
              border: none;
              cursor: pointer;
              font-weight: 500;
              &:hover {
                background: #5b21b6;
              }
            `}"
          >
            Login
          </button>
          <button 
            type="button"
            id="signupButton"
            class="${css`
              padding: 0.75rem;
              border-radius: 0.25rem;
              background: transparent;
              color: white;
              border: 1px solid #6d28d9;
              cursor: pointer;
              font-weight: 500;
              &:hover {
                background: rgba(109, 40, 217, 0.1);
              }
            `}"
          >
            Sign Up Instead
          </button>
        </form>

        <div id="authMessage" class="${css`
          margin-top: 1rem;
          text-align: center;
          color: #ef4444;
          min-height: 1.5rem;
        `}"></div>
      </div>
    `

    document.body.appendChild(this.container)
    this.setupEventListeners()
  }

  setupEventListeners() {
    const form = this.container.querySelector('#authForm')
    const signupButton = this.container.querySelector('#signupButton')
    const messageDiv = this.container.querySelector('#authMessage')
    let isSignup = false

    // Close modal when clicking outside
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide()
      }
    })

    // Toggle between login and signup
    signupButton.addEventListener('click', () => {
      isSignup = !isSignup
      signupButton.textContent = isSignup ? 'Login Instead' : 'Sign Up Instead'
      form.querySelector('button[type="submit"]').textContent = isSignup ? 'Sign Up' : 'Login'
    })

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = form.querySelector('#email').value
      const password = form.querySelector('#password').value
      
      try {
        let result
        if (isSignup) {
          result = await this.supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: email.split('@')[0], // Default username from email
              }
            }
          })
          
          if (result.data.user) {
            // Create user profile in our custom table
            await this.supabase.from('users').insert([
              {
                auth_id: result.data.user.id,
                email: email,
                username: email.split('@')[0]
              }
            ])
          }
        } else {
          result = await this.supabase.auth.signInWithPassword({
            email,
            password
          })
        }

        if (result.error) {
          throw result.error
        }

        // Success!
        messageDiv.style.color = '#22c55e'
        messageDiv.textContent = isSignup ? 'Account created! Logging in...' : 'Login successful!'
        
        // Reload after successful auth
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        messageDiv.style.color = '#ef4444'
        messageDiv.textContent = error.message
      }
    })
  }

  show() {
    this.visible = true
    this.container.style.display = 'flex'
  }

  hide() {
    this.visible = false
    this.container.style.display = 'none'
  }

  toggle() {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }
}
