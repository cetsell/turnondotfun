import React, { useRef } from 'react'

/**
 * Main HUD component for the game interface
 * Uses DOM elements for the UI
 */
export function GameHUD({ 
  playerName = 'Player', 
  health = 100, 
  score = 0,
  inventory = [],
  notifications = []
}) {
  const hudRef = useRef()

  return (
    <div ref={hudRef} className="fixed inset-0 pointer-events-none">
      {/* Top status bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <StatusBar 
          playerName={playerName}
          health={health}
          score={score}
        />
      </div>
      
      {/* Bottom inventory bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <InventoryBar items={inventory} />
      </div>
      
      {/* Notifications panel */}
      <div className="absolute top-4 right-4">
        <NotificationsPanel notifications={notifications} />
      </div>
    </div>
  )
}

/**
 * Status bar component showing player info
 */
function StatusBar({ playerName, health, score }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface bg-opacity-80 dark:bg-opacity-80 rounded-lg p-3 flex items-center justify-between gap-8 shadow-lg">
      {/* Player name */}
      <div className="text-primary font-bold text-lg">
        {playerName}
      </div>
      
      {/* Health bar */}
      <div className="relative w-32 h-5 bg-gray-800 dark:bg-gray-900 rounded-md overflow-hidden">
        <div 
          className="h-full rounded-md bg-green-500" 
          style={{ width: `${health}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
          {`${health}%`}
        </div>
      </div>
      
      {/* Score */}
      <div className="text-secondary font-bold text-lg">
        {score.toLocaleString()}
      </div>
    </div>
  )
}

/**
 * Inventory bar component
 */
function InventoryBar({ items = [] }) {
  const maxItems = 5
  const displayItems = items.slice(0, maxItems)
  
  return (
    <div className="bg-light-surface dark:bg-dark-surface bg-opacity-80 dark:bg-opacity-80 rounded-lg p-3 shadow-lg">
      {/* Inventory slots */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length: maxItems }).map((_, index) => {
          const item = displayItems[index]
          const hasItem = !!item
          
          return (
            <div 
              key={index} 
              className={`w-12 h-12 rounded flex items-center justify-center text-xl
                         ${hasItem ? 'bg-primary/20' : 'bg-gray-700 dark:bg-gray-800'}
                         ${hasItem ? 'opacity-100' : 'opacity-50'}`}
            >
              {hasItem && (
                <span className="text-light-text dark:text-dark-text font-bold">
                  {item.icon || "?"}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Notifications panel component
 */
function NotificationsPanel({ notifications = [] }) {
  const maxNotifications = 3
  const displayNotifications = notifications.slice(0, maxNotifications)
  
  return (
    <div className="bg-light-surface dark:bg-dark-surface bg-opacity-70 dark:bg-opacity-70 rounded-lg p-4 min-w-[250px] shadow-lg">
      {/* Header */}
      <div className="text-primary text-center font-bold mb-4">
        NOTIFICATIONS
      </div>
      
      {/* Notification items */}
      <div className="space-y-2">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notification, index) => (
            <div 
              key={index} 
              className="bg-primary/20 rounded p-2 opacity-60"
            >
              <div className="text-light-text dark:text-dark-text text-sm break-words">
                {notification.message}
              </div>
            </div>
          ))
        ) : (
          <div className="text-light-text-light dark:text-dark-text-light text-sm text-center py-2">
            No new notifications
          </div>
        )}
      </div>
    </div>
  )
}

export default GameHUD;
