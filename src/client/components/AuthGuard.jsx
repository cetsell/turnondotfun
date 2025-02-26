import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [verified, setVerified] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking auth:', error)
          setLoading(false)
          return
        }
        
        if (data.session) {
          // User is authenticated
          setAuthenticated(true)
          
          // Check if user is verified
          const { user } = data.session
          if (user.email_confirmed_at || user.confirmed_at) {
            console.log('User is verified:', user.email)
            setVerified(true)
          } else {
            console.log('User is NOT verified:', user.email)
            setVerified(false)
            
            // Store email for verification page
            sessionStorage.setItem('verification_email', user.email)
          }
        } else {
          setAuthenticated(false)
          setVerified(false)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in AuthGuard:', event)
        
        if (event === 'SIGNED_IN' && session) {
          setAuthenticated(true)
          
          // Check if user is verified
          const { user } = session
          if (user.email_confirmed_at || user.confirmed_at) {
            setVerified(true)
          } else {
            setVerified(false)
            // Store email for verification page
            sessionStorage.setItem('verification_email', user.email)
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthenticated(false)
          setVerified(false)
        } else if (event === 'USER_UPDATED') {
          // Check verification status again
          if (session?.user) {
            const { user } = session
            if (user.email_confirmed_at || user.confirmed_at) {
              setVerified(true)
            }
          }
        }
      }
    )
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])
  
  // Public routes that don't require authentication or verification
  const publicRoutes = ['/verify', '/reset-password', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(location.pathname)
  
  if (loading) {
    // Show loading state
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    )
  }
  
  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return children
  }
  
  // If not authenticated, redirect to home with login modal
  if (!authenticated) {
    return <Navigate to="/?login=true" replace />
  }
  
  // If authenticated but not verified, redirect to verification page
  if (authenticated && !verified) {
    return <Navigate to="/verify" replace />
  }
  
  // User is authenticated and verified, allow access
  return children
}
