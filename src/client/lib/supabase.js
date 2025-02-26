import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Get the Supabase URL and anon key from the environment variables
const supabaseUrl = window.process?.env?.SUPABASE_URL || config.supabaseUrl || 'https://llplimpcagldyzzbreha.supabase.co'
const supabaseAnonKey = window.process?.env?.SUPABASE_KEY || 
                        window.process?.env?.SUPABASE_ANON_KEY || 
                        config.supabaseKey || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscGxpbXBjYWdsZHl6emJyZWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjU3MjQ2NzQsImV4cCI6MjA0ODk5MDI3NH0.dZDh3Tq6yhPjQSR15PDYZvrVgBYKzHZUvKwc5UfkhWs'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Get the current site URL for redirects
const siteUrl = isBrowser ? window.location.origin : ''

// Log configuration for debugging
console.log(`Supabase Configuration:
  URL: ${supabaseUrl}
  Key length: ${supabaseAnonKey ? supabaseAnonKey.length : 'undefined'}
  Key prefix: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'undefined'}
  Site URL: ${siteUrl}
`)

// Create the Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // We'll handle this manually for better control
    flowType: 'pkce',
    redirectTo: `${siteUrl}/verify`,
    emailVerificationRequired: true,
  },
})

// If we're in a browser, check for auth parameters in the URL
if (isBrowser) {
  // Log client initialization
  console.log('Supabase client initialized with URL:', supabaseUrl)
  console.log('Site URL for redirects:', siteUrl)
  
  // Function to handle auth parameters in URL
  const handleAuthParams = () => {
    try {
      console.log('Checking for auth parameters in URL:', window.location.href)
      
      // Extract auth parameters from URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const queryParams = new URLSearchParams(window.location.search)
      
      // Check for token in various formats
      const token = hashParams.get('token') || queryParams.get('token') || 
                    hashParams.get('access_token') || queryParams.get('access_token')
      const type = hashParams.get('type') || queryParams.get('type') || 'signup'
      
      // If we have auth parameters but we're not on the verify page, store them and redirect
      if (token && !window.location.pathname.includes('/verify')) {
        console.log('Found auth token in URL, storing and redirecting to verify page')
        
        // Store parameters in sessionStorage
        sessionStorage.setItem('verification_token', token)
        if (type) sessionStorage.setItem('verification_type', type)
        
        // Redirect to verify page
        window.location.href = `${siteUrl}/verify`
        return true
      }
      
      // Also check for auth error parameters
      const errorCode = hashParams.get('error_code') || queryParams.get('error_code')
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
      
      if (errorCode && !window.location.pathname.includes('/verify')) {
        console.log('Found auth error in URL, redirecting to verify page')
        
        // Redirect to verify page with error parameters
        window.location.href = `${siteUrl}/verify?error_code=${encodeURIComponent(errorCode)}&error_description=${encodeURIComponent(errorDescription || '')}`
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error handling auth parameters:', error)
      return false
    }
  }
  
  // Run the handler when the client is initialized
  handleAuthParams()
  
  // Also listen for hash changes which might contain auth parameters
  window.addEventListener('hashchange', () => {
    console.log('Hash changed, checking for auth parameters')
    handleAuthParams()
  })
}

export default supabase
