import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginModal from './LoginModal'
import { css } from '@firebolt-dev/css'

export const AuthGuard = ({ children, onAuthenticated, requireAuth = true }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(requireAuth)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simple session check that works with SES
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          setError('Unable to verify authentication status')
        } else {
          console.log('Session check result:', data.session ? 'User is authenticated' : 'No session found')
          if (data.session) {
            console.log('User info:', {
              id: data.session.user.id,
              email: data.session.user.email,
              lastSignIn: data.session.user.last_sign_in_at
            })
          }
          
          setSession(data.session)
          if (data.session && onAuthenticated) {
            onAuthenticated(data.session)
          }
        }
      } catch (err) {
        console.error('Session check exception:', err)
        setError('Authentication service unavailable')
      } finally {
        setLoading(false)
      }
    }

    // Check for session on mount
    checkSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession ? 'session exists' : 'no session')
        
        if (newSession) {
          console.log('User authenticated:', {
            id: newSession.user.id,
            email: newSession.user.email,
            event: event
          })
        }
        
        setSession(newSession)
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && 
            newSession && onAuthenticated) {
          onAuthenticated(newSession)
        }
        
        // If user signed out, show login
        if (event === 'SIGNED_OUT' && requireAuth) {
          setShowLogin(true)
        }
        
        setLoading(false)
      }
    )

    // Clean up subscription
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [onAuthenticated, requireAuth])

  // Show login modal if no session and not loading
  useEffect(() => {
    if (!loading && !session && !error && requireAuth) {
      console.log('AuthGuard detected no session, showing login modal')
      setShowLogin(true)
    } else if (session) {
      setShowLogin(false)
    }
  }, [session, loading, error, requireAuth])

  if (loading) {
    return (
      <div
        css={css`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          z-index: 2000;
          color: white;
        `}
      >
        <div
          css={css`
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 1rem;
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        ></div>
        <p>Initializing authentication...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        css={css`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          z-index: 2000;
          color: white;
          text-align: center;
          padding: 2rem;
        `}
      >
        <h2
          css={css`
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #ef4444;
          `}
        >
          Authentication Error
        </h2>
        <p
          css={css`
            margin-bottom: 1rem;
          `}
        >
          {error}
        </p>
        <p
          css={css`
            font-size: 0.875rem;
            color: #9ca3af;
            margin-bottom: 1.5rem;
          `}
        >
          Our authentication service is currently experiencing issues. 
          Please try again later or contact support if the problem persists.
        </p>
        <button 
          css={css`
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            font-weight: 500;
            &:hover {
              background: #2563eb;
            }
          `}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {showLogin && (
        <LoginModal 
          onClose={() => {
            if (!requireAuth || session) {
              setShowLogin(false)
            }
          }} 
        />
      )}
      {(session || !requireAuth) && children}
    </>
  )
}

export default AuthGuard 