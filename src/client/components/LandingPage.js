import { css } from '@firebolt-dev/css'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LandingPage({ onEnter, userSession }) {
  const handleEnterClick = () => {
    console.log('Enter button clicked, calling onEnter callback');
    if (onEnter) {
      onEnter();
    }
  };

  return (
    <div
      className="landing-page"
      css={css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        color: white;
        z-index: 999;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      `}
    >
      {/* User Info Bar */}
      {userSession && (
        <div
          css={css`
            background: rgba(0, 0, 0, 0.5);
            padding: 0.75rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 0.5rem;
            `}
          >
            <div
              css={css`
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #8a2be2;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
              `}
            >
              {userSession.user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div
                css={css`
                  font-weight: 500;
                `}
              >
                {userSession.user.email}
              </div>
              <div
                css={css`
                  font-size: 0.75rem;
                  color: rgba(255, 255, 255, 0.7);
                `}
              >
                Logged in
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
            }}
            css={css`
              background: transparent;
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 0.5rem 1rem;
              border-radius: 0.25rem;
              cursor: pointer;
              transition: background 0.2s;
              
              &:hover {
                background: rgba(255, 255, 255, 0.1);
              }
            `}
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section
        css={css`
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 2rem;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('/day2-2k.jpg') center/cover no-repeat;
            opacity: 0.2;
            z-index: -1;
          }
        `}
      >
        <h1
          css={css`
            font-size: 3.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            line-height: 1.2;
            
            @media (max-width: 768px) {
              font-size: 2.5rem;
            }
          `}
        >
          Step Into Seductive Stories Brought to Life by AI
        </h1>
        
        <p
          css={css`
            font-size: 1.25rem;
            max-width: 800px;
            margin: 0 auto 2.5rem;
            
            @media (max-width: 768px) {
              font-size: 1rem;
            }
          `}
        >
          Explore immersive 3D worlds, customize your avatar, and experience captivating characters with real-time interactions.
        </p>
        
        <div
          css={css`
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
          `}
        >
          <button
            onClick={handleEnterClick}
            css={css`
              background: #8a2be2;
              color: white;
              border: none;
              padding: 1rem 2rem;
              font-size: 1.125rem;
              font-weight: 600;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background 0.3s;
              pointer-events: auto;
              
              &:hover {
                background: #9b4dff;
              }
            `}
          >
            {userSession ? 'Enter the World' : 'Sign In to Enter'}
          </button>
          
          <a
            href="#features"
            css={css`
              background: transparent;
              color: white;
              border: 2px solid white;
              padding: 1rem 2rem;
              font-size: 1.125rem;
              font-weight: 600;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background 0.3s;
              text-decoration: none;
              pointer-events: auto;
              
              &:hover {
                background: rgba(255, 255, 255, 0.1);
              }
            `}
          >
            Learn More
          </a>
        </div>
      </section>
      
      {/* Features Section */}
      <section
        id="features"
        css={css`
          padding: 5rem 2rem;
          background: rgba(0, 0, 0, 0.3);
        `}
      >
        <div
          css={css`
            max-width: 1200px;
            margin: 0 auto;
          `}
        >
          <h2
            css={css`
              font-size: 2.5rem;
              font-weight: bold;
              text-align: center;
              margin-bottom: 3rem;
            `}
          >
            Experience the Future of Interactive Storytelling
          </h2>
          
          <div
            css={css`
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 2rem;
            `}
          >
            <FeatureCard
              title="Rich Narratives"
              description="Dive into AI-crafted stories that evolve with your choices—seduction, intrigue, and adventure await."
            />
            
            <FeatureCard
              title="Unique Characters"
              description="Meet unforgettable characters with personalities and animations powered by cutting-edge AI and motion capture."
            />
            
            <FeatureCard
              title="Real-Time 3D"
              description="Interact in stunning, creator-built worlds where every move feels alive."
            />
            
            <FeatureCard
              title="Creator Marketplace"
              description="Build or buy your own stories, avatars, and animations to share with the world."
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section
        css={css`
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #30176e 0%, #8a2be2 100%);
          text-align: center;
        `}
      >
        <h2
          css={css`
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
          `}
        >
          Ready to Step Into Your Fantasy?
        </h2>
        
        <p
          css={css`
            font-size: 1.25rem;
            max-width: 800px;
            margin: 0 auto 2.5rem;
          `}
        >
          Join our community of creators and explorers today and experience stories like never before.
        </p>
        
        <button
          onClick={handleEnterClick}
          css={css`
            background: white;
            color: #30176e;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.125rem;
            font-weight: 600;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: background 0.3s;
            pointer-events: auto;
            
            &:hover {
              background: #f0f0f0;
            }
          `}
        >
          Enter the World Now
        </button>
      </section>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div
      css={css`
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.75rem;
        padding: 2rem;
        transition: transform 0.3s;
        
        &:hover {
          transform: translateY(-5px);
        }
      `}
    >
      <h3
        css={css`
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        `}
      >
        {title}
      </h3>
      
      <p
        css={css`
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        `}
      >
        {description}
      </p>
    </div>
  )
} 