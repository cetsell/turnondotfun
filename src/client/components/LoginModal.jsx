import React, { useState, useEffect } from 'react'
import { css } from '@firebolt-dev/css'
import { supabase } from '../lib/supabase'

export function LoginModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check for pre-filled email from verification page
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('login_email')
    if (storedEmail) {
      setEmail(storedEmail)
      sessionStorage.removeItem('login_email')
    }
    
    // Check if login=true is in the URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('login') === 'true') {
      // Remove the login parameter from the URL without refreshing
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('login')
      window.history.replaceState({}, document.title, newUrl.toString())
    }
  }, [])

  // Reset error when changing modes
  useEffect(() => {
    setError('')
    setSuccess('')
  }, [isSignup])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignup) {
        // Get the current site URL for redirects
        const siteUrl = window.location.origin
        console.log('Signup with redirect to:', `${siteUrl}/verify`)
        
        // Store email in sessionStorage for verification page
        sessionStorage.setItem('verification_email', email)
        
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/verify`,
            data: {
              email: email // Store email in user metadata for reference
            }
          },
        })

        if (error) throw error
        
        console.log('Signup response:', data)

        setSuccess(
          'Registration successful! Please check your email for verification instructions.'
        )
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        
        console.log('Signin successful:', data.user?.email)

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      css={css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.7);
      `}
    >
      <div
        css={css`
          background-color: #1a1a1a;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          color: white;
          position: relative;
        `}
      >
        <button
          css={css`
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 20px;
            color: #aaa;
            cursor: pointer;
            &:hover {
              color: white;
            }
          `}
          onClick={onClose}
        >
          ×
        </button>
        <h2
          css={css`
            margin-top: 0;
            margin-bottom: 1.5rem;
            text-align: center;
          `}
        >
          {isSignup ? 'Sign Up' : 'Sign In'}
        </h2>

        {error && (
          <div
            css={css`
              margin-bottom: 1rem;
              padding: 0.75rem;
              background-color: rgba(220, 38, 38, 0.2);
              color: #ef4444;
              border-radius: 4px;
              border: 1px solid rgba(220, 38, 38, 0.3);
            `}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            css={css`
              margin-bottom: 1rem;
              padding: 0.75rem;
              background-color: rgba(16, 185, 129, 0.2);
              color: #10b981;
              border-radius: 4px;
              border: 1px solid rgba(16, 185, 129, 0.3);
            `}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            css={css`
              margin-bottom: 1rem;
            `}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              css={css`
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 4px;
                border: 1px solid #444;
                background-color: #333;
                color: white;
                &::placeholder {
                  color: #aaa;
                }
              `}
            />
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            css={css`
              width: 100%;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 4px;
              border: 1px solid #444;
              background-color: #333;
              color: white;
              &::placeholder {
                color: #aaa;
              }
            `}
          />

          <button
            css={css`
              width: 100%;
              padding: 10px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              font-weight: 500;
              cursor: pointer;
              &:hover {
                background-color: #2563eb;
              }
              &:disabled {
                background-color: #93c5fd;
                cursor: not-allowed;
              }
              margin-bottom: 15px;
            `}
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Loading...' : isSignup ? 'Sign up' : 'Sign in'}
          </button>

          <div
            css={css`
              display: flex;
              justify-content: center;
              margin-top: 1rem;
            `}
          >
            <button
              css={css`
                background: none;
                border: none;
                color: #60a5fa;
                cursor: pointer;
                font-size: 14px;
                &:hover {
                  text-decoration: underline;
                }
              `}
              onClick={() => setIsSignup(!isSignup)}
              type="button"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Export as default as well for backward compatibility
export default LoginModal