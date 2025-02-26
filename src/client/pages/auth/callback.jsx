import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { css } from '@firebolt-dev/css'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        console.log('Auth callback params:', {
          hash: Object.fromEntries(hashParams.entries()),
          query: Object.fromEntries(queryParams.entries())
        })

        // Check for errors in the URL
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code')
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
        
        if (errorCode) {
          console.error('Auth callback error:', errorCode, errorDescription)
          
          // Handle specific error types
          if (errorCode === 'otp_expired') {
            setError('The verification link has expired. Please request a new one.')
            setStatus('error')
            return
          } else {
            setError(errorDescription || 'Authentication failed')
            setStatus('error')
            return
          }
        }

        // Check for specific auth types
        const type = hashParams.get('type') || queryParams.get('type')
        
        // If this is a signup or recovery flow, redirect to the appropriate page
        if (type === 'signup') {
          window.location.href = '/verify' + window.location.hash + window.location.search
          return
        } else if (type === 'recovery') {
          window.location.href = '/reset-password' + window.location.hash + window.location.search
          return
        }

        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setError(error.message || 'Failed to authenticate')
          setStatus('error')
          return
        }

        if (session) {
          console.log('Session established:', {
            user: session.user.email,
            expires_at: new Date(session.expires_at).toLocaleString()
          })
          
          setStatus('success')
          
          // Redirect to the home page or dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        } else {
          console.log('No session found after callback')
          setError('Authentication completed but no session was created')
          setStatus('error')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('An unexpected error occurred during authentication')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        color: white;
      `}
    >
      <div
        css={css`
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
        `}
      >
        {status === 'processing' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
              `}
            >
              Completing Authentication
            </h1>
            <p
              css={css`
                margin-bottom: 2rem;
              `}
            >
              Please wait while we complete the authentication process...
            </p>
            <div
              css={css`
                display: flex;
                justify-content: center;
                margin: 1rem 0;
              `}
            >
              <div
                css={css`
                  border: 4px solid rgba(255, 255, 255, 0.3);
                  border-top: 4px solid white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              ></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: #4caf50;
              `}
            >
              Authentication Successful!
            </h1>
            <p
              css={css`
                margin-bottom: 2rem;
              `}
            >
              You are now logged in. Redirecting you to the application...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: #ff6b6b;
              `}
            >
              Authentication Failed
            </h1>
            <p
              css={css`
                margin-bottom: 2rem;
              `}
            >
              {error || 'There was an error during authentication. Please try again.'}
            </p>
            <button
              css={css`
                background: #6c63ff;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
                cursor: pointer;
                transition: background 0.2s;
                &:hover {
                  background: #5a52d9;
                }
              `}
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}