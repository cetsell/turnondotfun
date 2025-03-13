import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AnimatedBackground } from './AnimatedBackground'

/**
 * Component for selecting and managing worlds
 */
export function WorldSelector({ onSelectWorld }) {
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newWorldName, setNewWorldName] = useState('')
  const [newWorldDescription, setNewWorldDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const { user, getToken, logout } = useAuth()

  // Fetch the list of worlds
  useEffect(() => {
    async function fetchWorlds() {
      try {
        setLoading(true)
        const response = await fetch('/api/worlds')
        if (!response.ok) {
          throw new Error(`Error fetching worlds: ${response.statusText}`)
        }
        
        const data = await response.json()
        setWorlds(data.worlds || [])
      } catch (err) {
        console.error('Failed to fetch worlds:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWorlds()
  }, [])

  // Handle world selection
  const handleSelectWorld = (worldId) => {
    if (onSelectWorld) {
      onSelectWorld(worldId)
    } else {
      navigate(`/world/${worldId}`)
    }
  }

  // Create a new world
  const handleCreateWorld = async (e) => {
    e.preventDefault()
    
    if (!newWorldName.trim()) {
      setError('World name is required')
      return
    }
    
    try {
      setCreating(true)
      
      const response = await fetch('/api/worlds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title: newWorldName.trim(),
          description: newWorldDescription.trim(),
          isPublic
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create world')
      }
      
      const data = await response.json()
      
      // Add the new world to the list
      setWorlds([...worlds, data.world])
      
      // Clear the form
      setNewWorldName('')
      setNewWorldDescription('')
      
      // Navigate to the new world
      handleSelectWorld(data.world.id)
    } catch (err) {
      console.error('Failed to create world:', err)
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  // Navigate to avatar customizer
  const handleCustomizeAvatar = () => {
    navigate('/avatar')
  }

  return (
    <div className="page-container">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto w-full">
        {/* Header with logout */}
        <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-4 mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Select a World</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCustomizeAvatar}
              className="btn btn-primary py-2 px-4 text-sm"
            >
              Customize Avatar
            </button>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary py-2 px-4 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">Loading worlds...</p>
          </div>
        ) : worlds.length === 0 ? (
          <div className="card text-center py-8">
            <h2 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">No Worlds Available</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Create your first world to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {worlds.map(world => (
              <div 
                key={world.id} 
                onClick={() => handleSelectWorld(world.id)}
                className="card cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <h2 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">{world.title}</h2>
                {world.description && (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2">
                    {world.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-light-text-secondary dark:text-dark-text-secondary opacity-60">
                  <span>{world.isPublic ? 'Public' : 'Private'}</span>
                  <span>Created: {new Date(world.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create new world form */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text">Create a New World</h2>
          
          <form onSubmit={handleCreateWorld} className="flex flex-col gap-6">
            <div className="form-group">
              <label htmlFor="worldName" className="form-label">World Name</label>
              <input
                id="worldName"
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="Enter a name for your world"
                className="w-full"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="worldDescription" className="form-label">Description (Optional)</label>
              <textarea
                id="worldDescription"
                value={newWorldDescription}
                onChange={(e) => setNewWorldDescription(e.target.value)}
                placeholder="Describe your world (optional)"
                className="w-full min-h-[100px] resize-y"
              />
            </div>
            
            <div className="flex items-center mb-6">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="isPublic" className="form-label cursor-pointer">Make this world public</label>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={creating || !newWorldName.trim()}
            >
              {creating ? 'Creating...' : 'Create World'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
