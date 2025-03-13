import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Client } from './world-client'
import { WorldSelector } from './components/WorldSelector'
import { LandingPage } from './components/LandingPage'
import { Login } from './components/Login'
import { Signup } from './components/Signup'
import { AvatarCustomizer } from './components/AvatarCustomizer.jsx'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ThemeProvider } from './theme/ThemeProvider'
// Import the theme utility to ensure Tailwind processes our theme classes
import { ensureThemeClassesAreProcessed } from './theme/theme-utils'

// This is just to make sure the function is referenced so Tailwind sees it
// The actual function call doesn't happen
const processThemeClasses = ensureThemeClassesAreProcessed;

/**
 * Protected route component that redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

/**
 * Main App component with routing for multi-world support
 */
export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Home route now goes to landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* World selection screen - protected route */}
            <Route 
              path="/worlds" 
              element={
                <ProtectedRoute>
                  <WorldSelector />
                </ProtectedRoute>
              } 
            />
            
            {/* Avatar customization - protected route */}
            <Route 
              path="/avatar" 
              element={
                <ProtectedRoute>
                  <AvatarCustomizer />
                </ProtectedRoute>
              } 
            />
            
            {/* Specific world route */}
            <Route path="/world/:worldId" element={<WorldRoute />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

/**
 * Component to handle loading a specific world
 */
function WorldRoute() {
  const { getToken } = useAuth()
  
  // Get worldId from URL
  const worldId = window.location.pathname.split('/').pop()
  
  // Construct WebSocket URL with worldId parameter
  // Automatically adjust the WebSocket protocol based on the current window protocol
  let wsUrl = process.env.PUBLIC_WS_URL
  
  // If we're on HTTP but trying to use WSS, switch to WS
  if (window.location.protocol === 'http:' && wsUrl.startsWith('wss://')) {
    wsUrl = wsUrl.replace('wss://', 'ws://')
    console.log('Switched to non-secure WebSocket for development')
  }
  
  // Get authentication token
  const authToken = getToken()
  
  // Add the worldId and authToken parameters
  wsUrl = `${wsUrl}?worldId=${worldId}${authToken ? `&authToken=${authToken}` : ''}`
  
  return <Client wsUrl={wsUrl} worldId={worldId} />
}
