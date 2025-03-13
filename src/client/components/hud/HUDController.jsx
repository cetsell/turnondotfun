import React, { useState, useEffect, useRef } from 'react'
import { GameHUD } from './GameHUD'
import { LogOutIcon } from 'lucide-react'

/**
 * Exit Button Component
 * Provides a way to exit the current world and return to the worlds lobby
 */
function ExitButton({ world }) {
  const handleExit = () => {
    // First disconnect from the world
    if (world && world.disconnect) {
      world.disconnect();
    }
    
    // Store the current auth token before navigation
    const authToken = localStorage.getItem('authToken');
    
    // Then navigate to the worlds page using absolute URL
    window.location.href = `${window.location.origin}/worlds`;
    
    // After navigation, ensure the token is still available
    // This is a safeguard in case the navigation process clears localStorage
    if (authToken) {
      setTimeout(() => {
        if (!localStorage.getItem('authToken')) {
          localStorage.setItem('authToken', authToken);
        }
      }, 100);
    }
  };

  return (
    <div 
      onClick={handleExit}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(22, 22, 28, 0.8)',
        backdropFilter: 'blur(3px)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        zIndex: 1000,
        pointerEvents: 'auto',
        transition: 'transform 0.2s, background-color 0.2s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.8)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'rgba(22, 22, 28, 0.8)';
      }}
    >
      <LogOutIcon size={24} />
    </div>
  );
}

/**
 * HUD Controller component
 * Manages the game state and renders the 3D HUD
 * This component acts as a bridge between Hyperfy and our custom HUD
 */
export function HUDController({ 
  player, 
  world,
  onNotificationClick,
  onInventorySelect
}) {
  // Game state
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Reference to the Hyperfy world
  const worldRef = useRef(world);
  
  // Update world reference when it changes
  useEffect(() => {
    worldRef.current = world;
  }, [world]);
  
  // Example: Listen for player health changes
  useEffect(() => {
    if (!player) return;
    
    const handleHealthChange = (newHealth) => {
      setHealth(newHealth);
      
      // Add notification if health is low
      if (newHealth < 30) {
        addNotification({
          message: "Health critical! Find health packs.",
          color: "#ff0000",
          type: "warning"
        });
      }
    };
    
    // Mock health change for demonstration
    const interval = setInterval(() => {
      const randomChange = Math.floor(Math.random() * 10) - 5;
      setHealth(prev => Math.max(0, Math.min(100, prev + randomChange)));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [player]);
  
  // Example: Listen for score changes
  useEffect(() => {
    if (!player) return;
    
    // Mock score change for demonstration
    const interval = setInterval(() => {
      const points = Math.floor(Math.random() * 100) + 10;
      setScore(prev => prev + points);
      
      if (points > 50) {
        addNotification({
          message: `+${points} points! Great job!`,
          color: "#4CAF50",
          type: "score"
        });
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [player]);
  
  // Example: Listen for inventory changes
  useEffect(() => {
    if (!player) return;
    
    // Mock inventory items for demonstration
    const mockItems = [
      { id: 1, name: "Sword", icon: "⚔️" },
      { id: 2, name: "Shield", icon: "🛡️" },
      { id: 3, name: "Potion", icon: "🧪" },
      { id: 4, name: "Key", icon: "🔑" },
      { id: 5, name: "Gem", icon: "💎" }
    ];
    
    setInventory(mockItems.slice(0, 3)); // Start with 3 items
    
    // Mock inventory change
    const interval = setInterval(() => {
      const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
      
      setInventory(prev => {
        // Check if item already exists
        const exists = prev.some(item => item.id === randomItem.id);
        
        if (!exists && prev.length < 5) {
          // Add new item
          addNotification({
            message: `Found: ${randomItem.name}`,
            color: "#2196F3",
            type: "inventory"
          });
          return [...prev, randomItem];
        } else if (prev.length > 0) {
          // Remove random item
          const indexToRemove = Math.floor(Math.random() * prev.length);
          const newInventory = [...prev];
          const removedItem = newInventory.splice(indexToRemove, 1)[0];
          
          addNotification({
            message: `Used: ${removedItem.name}`,
            color: "#FF9800",
            type: "inventory"
          });
          
          return newInventory;
        }
        
        return prev;
      });
    }, 15000);
    
    return () => clearInterval(interval);
  }, [player]);
  
  // Add a notification
  const addNotification = (notification) => {
    setNotifications(prev => {
      // Add timestamp and id
      const newNotification = {
        ...notification,
        id: Date.now(),
        timestamp: new Date()
      };
      
      // Keep only the 5 most recent notifications
      const updated = [newNotification, ...prev].slice(0, 5);
      
      // Auto-remove notifications after 5 seconds
      setTimeout(() => {
        setNotifications(current => 
          current.filter(n => n.id !== newNotification.id)
        );
      }, 5000);
      
      return updated;
    });
  };
  
  // Handle inventory item selection
  const handleInventorySelect = (item) => {
    if (onInventorySelect) {
      onInventorySelect(item);
    }
    
    // Example: Use the item and remove it from inventory
    // setInventory(prev => prev.filter(i => i.id !== item.id));
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Remove the notification when clicked
    setNotifications(prev => 
      prev.filter(n => n.id !== notification.id)
    );
  };
  
  return (
    <div className="hud-controller"
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px'
      }}
    >
      <GameHUD
        playerName={player?.name || "Player"}
        health={health}
        score={score}
        inventory={inventory}
        notifications={notifications}
      />
      <ExitButton world={world} />
    </div>
  )
}

export default HUDController;
