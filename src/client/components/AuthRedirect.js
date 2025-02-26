import { css } from '@firebolt-dev/css'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LoginModal } from './LoginModal'

export function AuthRedirect({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalInstance, setLoginModalInstance] = useState(null)

  useEffect(() => {
    // Initialize LoginModal
    if (!loginModalInstance) {
      setLoginModalInstance(new LoginModal());
    }

    const checkAuth = async () => {
      try {
        // Check if the user is authenticated
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking authentication:', error)
          setIsAuthenticated(false)
          setShowLoginModal(true)
          setLoading(false)
          return
        }
        
        if (data.session) {
          setIsAuthenticated(true)
        } else {
          setShowLoginModal(true)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in auth check:', error)
        setIsAuthenticated(false)
        setShowLoginModal(true)
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true)
          setShowLoginModal(false)
          loginModalInstance?.hide();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setShowLoginModal(true)
          loginModalInstance?.show();
        }
      }
    )

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [loginModalInstance])

  useEffect(() => {
    if (loginModalInstance) {
      if (showLoginModal) {
        loginModalInstance.show();
      } else {
        loginModalInstance.hide();
      }
    }
  }, [showLoginModal, loginModalInstance]);

  if (loading) {
    return (
      <div
        css={css`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1000;
        `}
      >
        <div
          css={css`
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 1rem;
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        ></div>
        <p>Checking authentication...</p>
      </div>
    )
  }

  // We're only showing the login modal through the class instance
  // so no need to render anything here when showLoginModal is true
  if (!isAuthenticated) {
    return null; // The modal is rendered by the class itself
  }

  return children
} 