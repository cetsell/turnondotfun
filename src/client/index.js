import 'ses'
import '../core/lockdown'
import { createRoot } from 'react-dom/client'

// Import global styles
import './styles/global.css'

// Import components
import { Client } from './world-client'
import { App } from './App'

// Determine what to render based on the current URL path
function Main() {
  const path = window.location.pathname
  
  // If we're at a known client-side route, render the App component with routing
  if (path === '/' || 
      path === '/login' || 
      path === '/signup' || 
      path === '/worlds' || 
      path === '/avatar') {
    return <App />
  }
  
  // Only treat paths that explicitly start with /world/ as world routes
  if (path.startsWith('/world/')) {
    // For world routes, render the Client component directly
    // Automatically adjust the WebSocket protocol based on the current window protocol
    let wsUrl = process.env.PUBLIC_WS_URL
    
    // If we're on HTTP but trying to use WSS, switch to WS
    if (window.location.protocol === 'http:' && wsUrl.startsWith('wss://')) {
      wsUrl = wsUrl.replace('wss://', 'ws://')
      console.log('Switched to non-secure WebSocket for development')
    }
    
    // Extract worldId from path
    const worldId = path.split('/').pop()
    
    // Add the worldId parameter
    wsUrl = `${wsUrl}?worldId=${worldId}`
    
    return <Client wsUrl={wsUrl} />
  }
  
  // For any other unknown routes, render the App component which will show the PageNotFound component
  return <App />
}

const root = createRoot(document.getElementById('root'))
root.render(<Main />)
