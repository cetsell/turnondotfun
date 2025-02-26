import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { css } from '@firebolt-dev/css'

export default function ResetPassword() {
  const [resetStatus, setResetStatus] = useState('verifying')
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    // Extract token from URL
    const handleReset = async () => {
      try {
        // Get the token from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        // Check for errors in the URL
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code')
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
        
        if (errorCode) {
          console.error('Reset error:', errorCode, errorDescription)
          setResetStatus('error')
          setError(errorDescription || 'Password reset failed. The link may have expired.')
          return
        }

        // Get the token and type
        const token = hashParams.get('token') || queryParams.get('token')
        const type = hashParams.get('type') || queryParams.get('type')
        
        console.log('Reset params:', {
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          type
        })
        
        if (!token) {
          setResetStatus('error')
          setError('Reset token is missing. Please check your email and try again.')
          return
        }

        // Get the email from the token if possible
        try {
          // Try to decode the JWT to extract the email
          const parts = token.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            if (payload.email) {
              setEmail(payload.email)
            }
          }
        } catch (e) {
          console.error('Error extracting email from token:', e)
        }

        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        })

        if (error) {
          console.error('Token verification error:', error)
          setResetStatus('error')
          setError(error.message || 'Password reset failed. Please try again.')
        } else {
          console.log('Reset token verified successfully')
          setResetStatus('set_password')
        }
      } catch (err) {
        console.error('Reset error:', err)
        setResetStatus('error')
        setError('An unexpected error occurred during password reset.')
      }
    }

    handleReset()
  }, [])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    
    // Validate passwords
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setIsSubmitting(true)
    setPasswordError('')
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) {
        console.error('Error setting new password:', error)
        setPasswordError(error.message || 'Failed to set password. Please try again.')
      } else {
        // Successfully set password
        setResetStatus('success')
      }
    } catch (err) {
      console.error('Error in password reset:', err)
      setPasswordError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render based on reset status
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        color: white;
      `}
    >
      <div
        css={css`
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        `}
      >
        {resetStatus === 'verifying' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
                text-align: center;
              `}
            >
              Verifying your reset link...
            </h1>
            <div
              css={css`
                display: flex;
                justify-content: center;
                margin: 2rem 0;
              `}
            >
              <div
                css={css`
                  border: 4px solid rgba(255, 255, 255, 0.3);
                  border-top: 4px solid white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              ></div>
            </div>
          </>
        )}

        {resetStatus === 'error' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
                text-align: center;
                color: #ff6b6b;
              `}
            >
              Password Reset Failed
            </h1>
            <p
              css={css`
                text-align: center;
                margin-bottom: 2rem;
              `}
            >
              {error || 'There was an error processing your password reset. The link may have expired.'}
            </p>
            <div
              css={css`
                display: flex;
                justify-content: center;
              `}
            >
              <button
                css={css`
                  background: #6c63ff;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  padding: 0.75rem 1.5rem;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: background 0.2s;
                  &:hover {
                    background: #5a52d9;
                  }
                `}
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </button>
            </div>
          </>
        )}

        {resetStatus === 'set_password' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
                text-align: center;
              `}
            >
              Reset Your Password
            </h1>
            <p
              css={css`
                text-align: center;
                margin-bottom: 2rem;
              `}
            >
              Please enter a new password for your account.
            </p>
            <form onSubmit={handleSetPassword}>
              {email && (
                <div
                  css={css`
                    margin-bottom: 1rem;
                  `}
                >
                  <label
                    css={css`
                      display: block;
                      margin-bottom: 0.5rem;
                    `}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    css={css`
                      width: 100%;
                      padding: 0.75rem;
                      border-radius: 5px;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      background: rgba(255, 255, 255, 0.1);
                      color: white;
                      font-size: 1rem;
                      &:focus {
                        outline: none;
                        border-color: #6c63ff;
                      }
                    `}
                  />
                </div>
              )}
              <div
                css={css`
                  margin-bottom: 1rem;
                `}
              >
                <label
                  css={css`
                    display: block;
                    margin-bottom: 0.5rem;
                  `}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  css={css`
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 5px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1rem;
                    &:focus {
                      outline: none;
                      border-color: #6c63ff;
                    }
                  `}
                />
              </div>
              <div
                css={css`
                  margin-bottom: 1rem;
                `}
              >
                <label
                  css={css`
                    display: block;
                    margin-bottom: 0.5rem;
                  `}
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  css={css`
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 5px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1rem;
                    &:focus {
                      outline: none;
                      border-color: #6c63ff;
                    }
                  `}
                />
              </div>
              {passwordError && (
                <div
                  css={css`
                    color: #ff6b6b;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                  `}
                >
                  {passwordError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                css={css`
                  width: 100%;
                  background: #6c63ff;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  padding: 0.75rem;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: background 0.2s;
                  &:hover {
                    background: #5a52d9;
                  }
                  &:disabled {
                    background: #4b45a9;
                    cursor: not-allowed;
                  }
                `}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password & Login'}
              </button>
            </form>
          </>
        )}

        {resetStatus === 'success' && (
          <>
            <h1
              css={css`
                font-size: 1.5rem;
                margin-bottom: 1rem;
                text-align: center;
                color: #4caf50;
              `}
            >
              Password Reset Successful!
            </h1>
            <p
              css={css`
                text-align: center;
                margin-bottom: 2rem;
              `}
            >
              Your password has been reset. You are now logged in.
            </p>
            <div
              css={css`
                display: flex;
                justify-content: center;
              `}
            >
              <button
                css={css`
                  background: #6c63ff;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  padding: 0.75rem 1.5rem;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: background 0.2s;
                  &:hover {
                    background: #5a52d9;
                  }
                `}
                onClick={() => window.location.href = '/'}
              >
                Continue to Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
