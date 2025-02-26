import { css } from '@firebolt-dev/css'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function LobbyPage({ onEnterWorld, userSession }) {
  const [worlds, setWorlds] = useState([
    {
      id: 'default',
      name: 'Main World',
      description: 'The main world where you can meet other users and explore.',
      image: '/day2-2k.jpg',
      isDefault: true
    },
    {
      id: 'garden',
      name: 'Secret Garden',
      description: 'A peaceful garden world for relaxation and meditation.',
      image: '/garden.jpg',
      comingSoon: true
    },
    {
      id: 'party',
      name: 'Party Plaza',
      description: 'A vibrant space for social gatherings and events.',
      image: '/party.jpg',
      comingSoon: true
    }
  ])

  const [selectedAvatar, setSelectedAvatar] = useState('default')
  const [avatars] = useState([
    { id: 'default', name: 'Default Avatar', image: '/avatars/default.jpg' },
    { id: 'custom1', name: 'Custom Avatar 1', image: '/avatars/custom1.jpg', locked: true },
    { id: 'custom2', name: 'Custom Avatar 2', image: '/avatars/custom2.jpg', locked: true }
  ])

  return (
    <div
      css={css`
        min-height: 100vh;
        background: linear-gradient(135deg, #1a0b2e 0%, #30176e 100%);
        color: white;
        padding: 2rem;
      `}
    >
      {/* Header with user info and logout */}
      <header
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 1rem;
          `}
        >
          <div
            css={css`
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: #8a2be2;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              font-weight: bold;
            `}
          >
            {userSession?.user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2
              css={css`
                font-size: 1.25rem;
                font-weight: 600;
              `}
            >
              Welcome, {userSession?.user?.email}
            </h2>
            <p
              css={css`
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.875rem;
              `}
            >
              Choose your world and avatar
            </p>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          css={css`
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
            }
          `}
        >
          Sign Out
        </button>
      </header>

      {/* Available Worlds */}
      <section
        css={css`
          margin-bottom: 3rem;
        `}
      >
        <h3
          css={css`
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
          `}
        >
          Available Worlds
        </h3>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          `}
        >
          {worlds.map((world) => (
            <div
              key={world.id}
              css={css`
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0.5rem;
                overflow: hidden;
                transition: transform 0.2s;
                
                &:hover {
                  transform: translateY(-4px);
                }
              `}
            >
              <div
                css={css`
                  position: relative;
                  padding-top: 56.25%; /* 16:9 aspect ratio */
                  background: url(${world.image}) center/cover;
                `}
              >
                {world.comingSoon && (
                  <div
                    css={css`
                      position: absolute;
                      top: 0.5rem;
                      right: 0.5rem;
                      background: rgba(0, 0, 0, 0.6);
                      color: white;
                      padding: 0.25rem 0.5rem;
                      border-radius: 0.25rem;
                      font-size: 0.75rem;
                    `}
                  >
                    Coming Soon
                  </div>
                )}
              </div>
              <div
                css={css`
                  padding: 1rem;
                `}
              >
                <h4
                  css={css`
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                  `}
                >
                  {world.name}
                </h4>
                <p
                  css={css`
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                  `}
                >
                  {world.description}
                </p>
                <button
                  onClick={() => !world.comingSoon && onEnterWorld(world.id)}
                  disabled={world.comingSoon}
                  css={css`
                    width: 100%;
                    background: ${world.comingSoon ? '#4a5568' : '#8a2be2'};
                    color: white;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 0.25rem;
                    cursor: ${world.comingSoon ? 'not-allowed' : 'pointer'};
                    transition: background 0.2s;
                    
                    &:hover:not(:disabled) {
                      background: #9b4dff;
                    }
                  `}
                >
                  {world.comingSoon ? 'Coming Soon' : 'Enter World'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Avatar Selection */}
      <section>
        <h3
          css={css`
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
          `}
        >
          Choose Your Avatar
        </h3>
        <div
          css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
          `}
        >
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              css={css`
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0.5rem;
                overflow: hidden;
                transition: transform 0.2s;
                opacity: ${avatar.locked ? 0.7 : 1};
                
                &:hover {
                  transform: ${avatar.locked ? 'none' : 'translateY(-4px)'};
                }
              `}
            >
              <div
                css={css`
                  position: relative;
                  padding-top: 100%; /* 1:1 aspect ratio */
                  background: url(${avatar.image}) center/cover;
                `}
              >
                {avatar.locked && (
                  <div
                    css={css`
                      position: absolute;
                      inset: 0;
                      background: rgba(0, 0, 0, 0.5);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 0.875rem;
                    `}
                  >
                    🔒 Locked
                  </div>
                )}
              </div>
              <div
                css={css`
                  padding: 1rem;
                `}
              >
                <h4
                  css={css`
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                  `}
                >
                  {avatar.name}
                </h4>
                <button
                  onClick={() => !avatar.locked && setSelectedAvatar(avatar.id)}
                  disabled={avatar.locked}
                  css={css`
                    width: 100%;
                    background: ${selectedAvatar === avatar.id ? '#8a2be2' : 'transparent'};
                    color: white;
                    border: 1px solid ${selectedAvatar === avatar.id ? '#8a2be2' : 'rgba(255, 255, 255, 0.3)'};
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    cursor: ${avatar.locked ? 'not-allowed' : 'pointer'};
                    transition: all 0.2s;
                    
                    &:hover:not(:disabled) {
                      background: ${selectedAvatar === avatar.id ? '#9b4dff' : 'rgba(255, 255, 255, 0.1)'};
                    }
                  `}
                >
                  {avatar.locked ? 'Locked' : selectedAvatar === avatar.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default LobbyPage 