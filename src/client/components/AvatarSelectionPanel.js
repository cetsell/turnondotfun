import { css } from '@firebolt-dev/css'
import { useState, useEffect } from 'react'
import { UserIcon, SmileIcon, SunIcon } from 'lucide-react'
import { Emotes } from '../../core/extras/playerEmotes'

const defaultAvatars = [
  { 
    id: 'default',
    name: 'Default Avatar',
    url: '/avatar.vrm'
  },
  {
    id: '0081501',
    name: '0081501462b207a952db265a413a7454b2d59de443639059b823895f24745033.vrm',
    url: '/0081501462b207a952db265a413a7454b2d59de443639059b823895f24745033.vrm'
  },
  {
    id: '7fca4a77',
    name: '7fca4a77fdc60ab2c78a9907430744562626180125fa386eb74fb2ea15c2e518.vrm',
    url: '/7fca4a77fdc60ab2c78a9907430744562626180125fa386eb74fb2ea15c2e518.vrm'
  },
  {
    id: 'e219cd9a',
    name: 'e219cd9ac581f272c9a0050029e17ad3b4cab6e94e31bf92c187502c5845ceb7.vrm',
    url: '/e219cd9ac581f272c9a0050029e17ad3b4cab6e94e31bf92c187502c5845ceb7.vrm'
  },
  {
    id: '2cb754ed',
    name: '2cb754ed8f72aea04e0116fe948cab26ae4d26d35670e465d4af2e3f52784491.vrm',
    url: '/2cb754ed8f72aea04e0116fe948cab26ae4d26d35670e465d4af2e3f52784491.vrm'
  }
]

// Define available skyboxes
const skyboxes = [
  { 
    id: 'day',
    name: 'Sunny Day',
    url: 'asset://day2.hdr'
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    url: 'asset://sunset.hdr'
  },
  {
    id: 'night',
    name: 'Night Sky',
    url: 'asset://night.hdr'
  },
  {
    id: 'studio',
    name: 'Studio',
    url: 'asset://studio.hdr'
  }
]

// Use the built-in Emotes enum
const emotesList = Object.entries(Emotes).map(([key, value]) => ({
  id: key,
  name: key.toLowerCase(),
  value
}))

export function AvatarSelectionPanel({ onSelectAvatar, onSelectEmote, onSelectSkybox, currentEmote, currentSkybox, defaultTab = 'avatars' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  const handleMouseDown = (e) => {
    e.stopPropagation()
  }

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.id)
    onSelectAvatar(avatar)
  }

  const handleEmoteSelect = (emote) => {
    onSelectEmote?.(emote.value)
  }

  const handleSkyboxSelect = (skybox) => {
    onSelectSkybox?.(skybox)
  }

  return (
    <div 
      className="avatar-selection-panel"
      onMouseDown={handleMouseDown}
      onPointerDown={handleMouseDown}
      css={css`
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 250px;
        background: rgba(22, 22, 28, 0.95);
        border-left: 1px solid rgba(255, 255, 255, 0.03);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        backdrop-filter: blur(10px);
        pointer-events: auto;
        
        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 20px;
          
          .tab {
            flex: 1;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            font-size: 13px;
            
            &.active {
              color: white;
              border-bottom: 2px solid white;
            }
            
            &:hover {
              color: white;
            }
          }
        }
        
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          
          .item {
            padding: 12px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
              transform: translateX(-2px);
            }
            
            &.active {
              background: rgba(255, 255, 255, 0.15);
              border-left: 3px solid white;
            }

            .icon {
              width: 24px;
              height: 24px;
              border-radius: 12px;
              background: rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      `}
    >
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'avatars' ? 'active' : ''}`}
          onClick={() => setActiveTab('avatars')}
        >
          <UserIcon size={16} />
          <span>Avatars</span>
        </div>
        <div 
          className={`tab ${activeTab === 'emotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('emotes')}
        >
          <SmileIcon size={16} />
          <span>Emotes</span>
        </div>
        <div 
          className={`tab ${activeTab === 'skybox' ? 'active' : ''}`}
          onClick={() => setActiveTab('skybox')}
        >
          <SunIcon size={16} />
          <span>Skybox</span>
        </div>
      </div>
      
      <div className="content noscrollbar">
        {activeTab === 'avatars' && (
          <>
            {defaultAvatars.map(avatar => (
              <div
                key={avatar.id}
                className={`item ${selectedAvatar === avatar.id ? 'active' : ''}`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                <div className="icon">
                  <UserIcon size={14} />
                </div>
                <span className="name">{avatar.name.length > 20 ? avatar.name.substring(0, 20) + '...' : avatar.name}</span>
              </div>
            ))}
          </>
        )}
        
        {activeTab === 'emotes' && (
          <>
            {emotesList.map(emote => (
              <div
                key={emote.id}
                className={`item ${currentEmote === emote.value ? 'active' : ''}`}
                onClick={() => handleEmoteSelect(emote)}
              >
                <div className="icon">
                  <SmileIcon size={14} />
                </div>
                <span className="name">{emote.name}</span>
              </div>
            ))}
          </>
        )}

        {activeTab === 'skybox' && (
          <>
            {skyboxes.map(skybox => (
              <div
                key={skybox.id}
                className={`item ${currentSkybox === skybox.id ? 'active' : ''}`}
                onClick={() => handleSkyboxSelect(skybox)}
              >
                <div className="icon">
                  <SunIcon size={14} />
                </div>
                <span className="name">{skybox.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
} 