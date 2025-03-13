import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatedBackground } from './AnimatedBackground'

/**
 * Signup component for user registration
 */
export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill out all fields')
      return
    }
    
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
      console.log('Signup response:', { status: response.status, data })
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }
      
      // Show verification message instead of redirecting
      setVerificationSent(true)
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verificationSent) {
    return (
      <div className="page-container">
        <AnimatedBackground />
        <div className="card w-full max-w-md text-center">
          <h1 className="title mb-4">Verify Your Email</h1>
          <p className="subtitle mb-8">We've sent a verification link to your email address.</p>
          
          <div className="mt-6 flex flex-col gap-4">
            <div className="glass bg-light-card/50 dark:bg-dark-card/50 rounded-lg p-5 border border-light-border dark:border-dark-border">
              <p className="text-light-text dark:text-dark-text mb-3">
                Please check your inbox and click the verification link to activate your account.
              </p>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                After verification, you'll be able to log in and start exploring worlds.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary mt-8"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <AnimatedBackground />
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="title mb-4">Create Account</h1>
          <p className="subtitle">Sign up to start creating and exploring worlds</p>
        </div>
        
        {error && (
          <div className="error-message mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          <div className="glass bg-light-card/50 dark:bg-dark-card/50 rounded-lg p-5 border border-light-border dark:border-dark-border">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
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
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="glass bg-light-card/50 dark:bg-dark-card/50 rounded-lg p-4 mt-6 text-center border border-light-border dark:border-dark-border">
          <p className="mb-3 text-light-text-secondary dark:text-dark-text-secondary">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="link-secondary"
            >
              Login
            </Link>
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            <Link 
              to="/" 
              className="link-primary"
            >
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
