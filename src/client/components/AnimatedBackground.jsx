import React from 'react'

/**
 * Reusable animated gradient background component
 * This implementation uses all semantic colors from the theme
 */
export function AnimatedBackground() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(-45deg, #FF886D, #FFC56D, #9CFF6D, #6DC2FF)',
        backgroundSize: '400% 400%',
        WebkitAnimation: 'gradient 15s ease infinite',
        animation: 'gradient 15s ease infinite',
        opacity: 0.2,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  )
} 