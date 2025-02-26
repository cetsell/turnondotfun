import { css } from '@firebolt-dev/css'
import { HomeIcon } from 'lucide-react'
import { useState } from 'react'

export function LandingPageButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = (e) => {
    console.log('LandingPageButton: Clicked')
    // Prevent event from bubbling up to prevent world interaction
    e.stopPropagation()
    onClick?.(e)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => {
        console.log('LandingPageButton: Mouse enter')
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        console.log('LandingPageButton: Mouse leave')
        setIsHovered(false)
      }}
      css={css`
        position: absolute;
        top: 20px;
        left: 100px; /* Position it to the right of the Shop button */
        background: ${isHovered ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
        border: 1px solid ${isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
        backdrop-filter: blur(10px);
        z-index: 100;
        transition: all 0.2s ease-out;
        pointer-events: auto;
        
        &:active {
          transform: scale(0.98);
          background: rgba(0, 0, 0, 0.8);
        }
      `}
    >
      <HomeIcon size={16} />
      <span>Home</span>
    </button>
  )
} 