import '../core/lockdown'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { css } from '@firebolt-dev/css'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'

import { createClientWorld } from '../core/createClientWorld'
import { loadPhysX } from './loadPhysX'
import { GUI } from './components/GUI'
import { LandingPage } from './components/LandingPage'
import { LobbyPage } from './components/LobbyPage'
import { AuthGuard } from './components/AuthGuard'
import { supabase } from './lib/supabase'
import { LoginModal } from './components/LoginModal'
import { ResetPassword } from './components/ResetPassword'

// Import the verify page
import VerifyEmail from './pages/verify'
import ResetPasswordPage from './pages/reset-password'

// Ensure environment variables are available
const env = window.process?.env || {
  PUBLIC_WS_URL: 'http://localhost:3000/ws',
  PUBLIC_API_URL: 'http://localhost:3000/api'
};

// Landing page component
function Home() {
  const navigate = useNavigate()
  const [userSession, setUserSession] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // Check for login parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('login') === 'true') {
      setShowLoginModal(true)
      // Remove the login parameter from the URL without refreshing
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('login')
      window.history.replaceState({}, document.title, newUrl.toString())
    }
  }, [])
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUserSession(data.session)
      }
    }
    checkSession()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUserSession(session)
        } else if (event === 'SIGNED_OUT') {
          setUserSession(null)
        }
      }
    )
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])
  
  return (
    <div className="App">
      <LandingPage 
        onEnter={() => {
          if (userSession) {
            navigate('/lobby')
          } else {
            setShowLoginModal(true)
          }
        }} 
        userSession={userSession}
      />
      
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={() => {
            setShowLoginModal(false)
            navigate('/lobby')
          }}
        />
      )}
    </div>
  )
}

// Lobby page wrapper
function Lobby() {
  const navigate = useNavigate()
  const [userSession, setUserSession] = useState(null)
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUserSession(data.session)
      } else {
        // Redirect to home if no session
        navigate('/')
      }
    }
    checkSession()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUserSession(session)
        } else if (event === 'SIGNED_OUT') {
          navigate('/')
        }
      }
    )
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [navigate])
  
  return userSession ? (
    <LobbyPage 
      onEnterWorld={(worldId) => navigate(`/world/${worldId}`)}
      userSession={userSession}
    />
  ) : (
    <div
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        color: white;
      `}
    >
      Loading...
    </div>
  )
}

// Game world component
function GameWorld() {
  const { worldId } = useParams()
  const viewportRef = useRef()
  const uiRef = useRef()
  const world = useMemo(() => createClientWorld(), [])
  const [isInitialized, setIsInitialized] = useState(false)
  const [userSession, setUserSession] = useState(null)
  const navigate = useNavigate()
  
  // Initialize the world
  useEffect(() => {
    const viewport = viewportRef.current
    const ui = uiRef.current
    const wsUrl = env.PUBLIC_WS_URL
    const apiUrl = env.PUBLIC_API_URL
    
    if (viewport && ui) {
      console.log(`Initializing world: ${worldId}`)
      world.init({ viewport, ui, wsUrl, apiUrl, loadPhysX, worldId })
      setIsInitialized(true)
    }
    
    return () => {
      // Cleanup when unmounting
      if (isInitialized) {
        console.log(`Cleaning up world: ${worldId}`)
        world.cleanup && world.cleanup()
      }
    }
  }, [world, worldId, isInitialized])
  
  // Set up UI event handlers
  useEffect(() => {
    const ui = uiRef.current
    if (!ui) return
    
    const onEvent = e => {
      e.isGUI = true
    }
    ui.addEventListener('click', onEvent)
    ui.addEventListener('pointerdown', onEvent)
    ui.addEventListener('pointermove', onEvent)
    ui.addEventListener('pointerup', onEvent)
    
    return () => {
      ui.removeEventListener('click', onEvent)
      ui.removeEventListener('pointerdown', onEvent)
      ui.removeEventListener('pointermove', onEvent)
      ui.removeEventListener('pointerup', onEvent)
    }
  }, [])
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUserSession(data.session)
        
        // Set user data in world context
        if (world.network) {
          world.network.userData = {
            id: data.session.user.id,
            email: data.session.user.email
          }
        }
      } else {
        // Redirect to home if no session
        navigate('/')
      }
    }
    checkSession()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUserSession(session)
        } else if (event === 'SIGNED_OUT') {
          navigate('/')
        }
      }
    )
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [navigate, world])
  
  return (
    <>
      <div className='App__viewport' ref={viewportRef} />
      <div className='App__ui' ref={uiRef}>
        <GUI 
          world={world} 
          onExit={() => navigate('/lobby')}
          worldId={worldId}
        />
      </div>
    </>
  )
}

// Check for auth parameters in URL
function AuthCallbackHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const hash = location.hash
    
    // Check for password reset flow
    if (hash && hash.includes('type=recovery')) {
      navigate('/reset-password' + hash)
      return
    }
    
    // Check for verification flow
    if (hash && hash.includes('type=signup')) {
      navigate('/verify' + hash)
      return
    }
    
    // Default redirect
    navigate('/')
  }, [location, navigate])
  
  return (
    <div
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        color: white;
      `}
    >
      Processing authentication...
    </div>
  )
}

// Main App component with routes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackHandler />} />
        
        {/* Protected routes */}
        <Route 
          path="/lobby" 
          element={
            <AuthGuard>
              <Lobby />
            </AuthGuard>
          } 
        />
        <Route 
          path="/world/:worldId" 
          element={
            <AuthGuard>
              <GameWorld />
            </AuthGuard>
          } 
        />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Initialize the app
const rootElement = document.getElementById('root')
if (rootElement) {
  console.log('Initializing app...')
  const root = createRoot(rootElement)
  root.render(<App />)
} else {
  console.error('Root element not found')
}
