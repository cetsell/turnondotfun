import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { css } from '@firebolt-dev/css'
import { useNavigate } from 'react-router-dom'

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState('verifying')
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Extract token from URL
    const handleVerification = async () => {
      try {
        console.log('Starting verification process...')
        console.log('Current URL:', window.location.href)
        
        // Get the token from the URL - check all possible locations
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        // Log all URL parameters for debugging
        console.log('Hash parameters:', Object.fromEntries(hashParams.entries()))
        console.log('Query parameters:', Object.fromEntries(queryParams.entries()))
        
        // Check for errors in the URL
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code')
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
        
        if (errorCode) {
          console.error('Verification error from URL:', errorCode, errorDescription)
          setVerificationStatus('error')
          setError(errorDescription || 'Verification failed. The link may have expired.')
          return
        }

        // Get the token and type - check all possible parameter names
        let token = hashParams.get('token') || queryParams.get('token') || 
                    hashParams.get('access_token') || queryParams.get('access_token')
        let type = hashParams.get('type') || queryParams.get('type') || 'signup'
        
        // Check sessionStorage for token and type
        const storedToken = sessionStorage.getItem('verification_token')
        const storedType = sessionStorage.getItem('verification_type')
        const storedEmail = sessionStorage.getItem('verification_email')
        
        if (storedEmail) {
          setEmail(storedEmail)
          console.log('Using email from sessionStorage:', storedEmail)
        }
        
        if (storedToken && !token) {
          token = storedToken
          console.log('Using token from sessionStorage:', token ? `${token.substring(0, 5)}...` : 'missing')
          // Clear the stored token to prevent reuse
          sessionStorage.removeItem('verification_token')
        }
        
        if (storedType && !type) {
          type = storedType
          console.log('Using type from sessionStorage:', type)
          sessionStorage.removeItem('verification_type')
        }
        
        // Check if we're in the middle of a Supabase auth flow
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('User already has an active session:', session.user.email)
          
          // Check if the user is verified
          const { user } = session
          if (user.email_confirmed_at || user.confirmed_at) {
            console.log('User is verified, redirecting to app')
            setVerificationStatus('success')
            
            // Redirect to the main app after a short delay
            setTimeout(() => {
              navigate('/')
            }, 2000)
          } else {
            console.log('User is not verified, showing verification required message')
            setVerificationStatus('error')
            setError('Your email is not verified. Please check your email for a verification link.')
          }
          return
        }
        
        console.log('Final verification params:', {
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          type,
          url: window.location.href
        })
        
        if (!token) {
          console.error('No verification token found after all extraction attempts')
          setVerificationStatus('error')
          setError('Verification token is missing. Please check your email and try again.')
          return
        }

        // Manually verify the token
        try {
          console.log('Attempting to verify token...')
          
          // First try with token parameter
          let verifyResult = await supabase.auth.verifyOtp({
            token: token,
            type: type
          })
          
          if (verifyResult.error) {
            console.error('First verification attempt failed:', verifyResult.error)
            
            // Try with token_hash parameter as fallback
            verifyResult = await supabase.auth.verifyOtp({
              token_hash: token,
              type: type
            })
            
            // If still failing, try with different type
            if (verifyResult.error) {
              console.error('Second verification attempt failed:', verifyResult.error)
              
              // Try with recovery type
              verifyResult = await supabase.auth.verifyOtp({
                token: token,
                type: 'recovery'
              })
            }
          }
          
          if (verifyResult.error) {
            console.error('Token verification error:', verifyResult.error)
            setVerificationStatus('error')
            setError(verifyResult.error.message || 'Verification failed. Please try again.')
          } else {
            console.log('Email verified successfully')
            setVerificationStatus('success')
            
            // Check if we're logged in
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              console.log('User is logged in after verification:', session.user.email)
              // Redirect to the main app after a short delay
              setTimeout(() => {
                navigate('/')
              }, 2000)
            } else {
              console.log('User is not logged in after verification, attempting auto-login')
              
              // If we have the email stored, try to sign in
              if (email) {
                // We don't have the password, so we'll need to redirect to login with email pre-filled
                sessionStorage.setItem('login_email', email)
                console.log('Redirecting to login with email pre-filled:', email)
              }
              
              // Redirect to login page
              setTimeout(() => {
                navigate('/?login=true')
              }, 2000)
            }
          }
        } catch (error) {
          console.error('Exception during token verification:', error)
          setVerificationStatus('error')
          setError('An unexpected error occurred during verification. Please try again.')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setVerificationStatus('error')
        setError('An unexpected error occurred during verification.')
      }
    }

    handleVerification()
  }, [navigate, email])

  // Render based on verification status
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #1a1a1a;
        color: white;
        padding: 20px;
      `}
    >
      <div
        css={css`
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 32px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        `}
      >
        {verificationStatus === 'verifying' && (
          <>
            <h1>Verifying your email</h1>
            <p>Please wait while we verify your email address...</p>
            <div
              css={css`
                margin-top: 20px;
                display: inline-block;
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #3b82f6;
                animation: spin 1s ease-in-out infinite;
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}
            ></div>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <h1>Email Verified!</h1>
            <p>Your email has been successfully verified.</p>
            <p>You will be redirected to the app shortly...</p>
            <button
              css={css`
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                &:hover {
                  background-color: #2563eb;
                }
              `}
              onClick={() => navigate('/')}
            >
              Go to App
            </button>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <h1>Verification Failed</h1>
            <p>{error || 'An error occurred during the verification process.'}</p>
            <p>Email verification is required to access the app. Please check your email for a verification link or request a new one.</p>
            <button
              css={css`
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                &:hover {
                  background-color: #2563eb;
                }
              `}
              onClick={() => navigate('/?login=true')}
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
