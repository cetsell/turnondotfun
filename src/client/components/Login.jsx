import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AnimatedBackground } from './AnimatedBackground'

/**
 * Login component for user authentication
 */
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuth()
  
  // Check for verification errors in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const verificationError = params.get('verificationError')
    
    if (verificationError) {
      setError(`Verification failed: ${verificationError}`)
    }
  }, [location])

  // Effect to redirect when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to worlds page')
      navigate('/worlds')
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('Attempting login with:', { email })
      
      // Use the AuthContext login function instead of direct fetch
      const data = await login(email, password)
      console.log('Login successful:', data)
      
      // The redirect will happen automatically via the useEffect above
      // when the user state is updated in the AuthContext
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <AnimatedBackground />
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="title mb-3">Login</h1>
          <p className="subtitle">Welcome back! Please log in to continue</p>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="glass bg-light-card/50 dark:bg-dark-card/50 rounded-lg p-8 border border-light-border dark:border-dark-border">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
                required
              />
            </div>
            
            <div className="form-group mb-0">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="glass bg-light-card/50 dark:bg-dark-card/50 rounded-lg p-8 mt-6 text-center border border-light-border dark:border-dark-border">
          <div className="flex flex-col gap-6">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="link-secondary font-medium"
              >
                Sign up
              </Link>
            </p>
            <p>
              <Link 
                to="/" 
                className="link-primary font-medium"
              >
                Back to Home
              </Link>
            </p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary opacity-70 mt-4">
              Need to verify your email? Check your inbox for the verification link.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
