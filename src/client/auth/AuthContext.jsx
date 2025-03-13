import React, { createContext, useState, useContext, useEffect } from 'react'

// Create the auth context
const AuthContext = createContext(null)

/**
 * Provider component for authentication context
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          console.log('Auth check: No access token found')
          // No token available
          localStorage.removeItem('authToken')
          setLoading(false)
          return
        }
        
        console.log('Auth check: Found token, validating with server')
        // Validate the token with the server
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          console.log('Auth check: Token validation failed')
          // Token is invalid, remove it
          localStorage.removeItem('authToken')
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log('Auth check: Token validated successfully')
        setUser(data.user)
      } catch (err) {
        console.error('Auth check error:', err)
        setError(err.message)
        // Clear token on error
        localStorage.removeItem('authToken')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      // Store the token
      if (data.token) {
        console.log('AuthContext login: Storing token')
        localStorage.setItem('authToken', data.token)
      } else if (data.session?.access_token) {
        // Fallback for older API format
        console.log('AuthContext login: Storing session token')
        localStorage.setItem('authToken', data.session.access_token)
      } else {
        console.warn('AuthContext login: No token found in response')
      }
      
      // Set user data
      setUser(data.user)
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Signup function
  const signup = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }
      
      // Store the token
      if (data.token) {
        console.log('AuthContext login: Storing token')
        localStorage.setItem('authToken', data.token)
      } else if (data.session?.access_token) {
        // Fallback for older API format
        console.log('AuthContext login: Storing session token')
        localStorage.setItem('authToken', data.session.access_token)
      } else {
        console.warn('AuthContext login: No token found in response')
      }
      
      // Set user data
      setUser(data.user)
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
  }

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('authToken')
  }

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    getToken,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
