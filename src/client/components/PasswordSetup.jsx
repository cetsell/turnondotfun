import { useState } from 'react';
import { css } from '@firebolt-dev/css';
import { supabase } from '../lib/supabase';

export function PasswordSetup({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Your session has expired. Please sign in again.');
        setIsLoading(false);
        return;
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Error setting password:', updateError);
        setError(`Failed to set password: ${updateError.message}`);
      } else {
        console.log('Password set successfully');
        setIsSuccess(true);
        
        // Notify parent component that password setup is complete
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1500);
      }
    } catch (err) {
      console.error('Exception setting password:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        pointer-events: auto !important;
        user-select: auto !important;
      `}
    >
      <div
        css={css`
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        `}
      >
        <h1
          css={css`
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          `}
        >
          Set Your Password
        </h1>
        <p
          css={css`
            font-size: 1.125rem;
            max-width: 500px;
          `}
        >
          Please create a password for your account to complete the setup.
        </p>
      </div>
      
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
        {isSuccess ? (
          <div
            css={css`
              text-align: center;
              color: white;
            `}
          >
            <h2
              css={css`
                color: white;
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
              `}
            >
              Password Set Successfully
            </h2>
            <p
              css={css`
                margin-bottom: 1.5rem;
                color: #22c55e;
              `}
            >
              Your password has been set. You will be redirected to the game world shortly.
            </p>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              css={css`
                display: flex;
                flex-direction: column;
                gap: 1rem;
              `}
            >
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                minLength={6}
                css={css`
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
              
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                minLength={6}
                css={css`
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
              
              <button 
                type="submit"
                disabled={isLoading}
                css={css`
                  padding: 0.75rem;
                  border-radius: 0.25rem;
                  background: #6d28d9;
                  color: white;
                  border: none;
                  cursor: pointer;
                  font-weight: 500;
                  &:hover {
                    background: #5b21b6;
                  }
                  &:disabled {
                    background: #4a1d96;
                    cursor: not-allowed;
                    opacity: 0.7;
                  }
                `}
              >
                {isLoading ? 'Setting Password...' : 'Set Password'}
              </button>
            </form>

            {error && (
              <div
                css={css`
                  margin-top: 1rem;
                  text-align: center;
                  color: #ef4444;
                  min-height: 1.5rem;
                `}
              >
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PasswordSetup; 