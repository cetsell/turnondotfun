import { css } from '@firebolt-dev/css'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function ResetPassword({ onClose }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check for stored messages
    const storedError = localStorage.getItem('auth_error')
    const storedSuccess = localStorage.getItem('auth_success')
    
    if (storedError) {
      const { message } = JSON.parse(storedError)
      setError(message)
      localStorage.removeItem('auth_error')
    }
    
    if (storedSuccess) {
      const { message } = JSON.parse(storedSuccess)
      setMessage(message)
      localStorage.removeItem('auth_success')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setMessage('Password updated successfully! You can now log in with your new password.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      css={css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `}
    >
      <div
        css={css`
          background: #1a1a1a;
          padding: 2rem;
          border-radius: 0.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        `}
      >
        <h2
          css={css`
            color: white;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
          `}
        >
          Reset Your Password
        </h2>

        {success ? (
          <div
            css={css`
              text-align: center;
              color: #22c55e;
            `}
          >
            <p
              css={css`
                margin-bottom: 1.5rem;
              `}
            >
              {message}
            </p>
            <button
              onClick={onClose}
              css={css`
                background: #6d28d9;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: 500;
                width: 100%;
                
                &:hover {
                  background: #5b21b6;
                }
              `}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              css={css`
                margin-bottom: 1rem;
              `}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                css={css`
                  width: 100%;
                  padding: 0.75rem;
                  border-radius: 0.25rem;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  color: white;
                  margin-bottom: 1rem;
                  
                  &:focus {
                    outline: none;
                    border-color: #6d28d9;
                  }
                `}
              />
              
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
                css={css`
                  width: 100%;
                  padding: 0.75rem;
                  border-radius: 0.25rem;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  color: white;
                  
                  &:focus {
                    outline: none;
                    border-color: #6d28d9;
                  }
                `}
              />
            </div>

            {error && (
              <div
                css={css`
                  color: #ef4444;
                  margin-bottom: 1rem;
                  text-align: center;
                `}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                css={css`
                  color: #22c55e;
                  margin-bottom: 1rem;
                  text-align: center;
                `}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              css={css`
                width: 100%;
                background: #6d28d9;
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: 500;
                margin-bottom: 1rem;
                
                &:hover:not(:disabled) {
                  background: #5b21b6;
                }
                
                &:disabled {
                  opacity: 0.7;
                  cursor: not-allowed;
                }
              `}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>

            <button
              type="button"
              onClick={onClose}
              css={css`
                width: 100%;
                background: transparent;
                color: white;
                border: 1px solid #6d28d9;
                padding: 0.75rem;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: 500;
                
                &:hover {
                  background: rgba(109, 40, 217, 0.1);
                }
              `}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword 