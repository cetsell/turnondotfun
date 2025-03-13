import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from './AnimatedBackground'

/**
 * Landing page component for new users
 */
export function LandingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Handle navigation to login/signup
  const handleGetStarted = () => {
    navigate('/login')
  }

  // Handle navigation to worlds as guest
  const handleExploreAsGuest = () => {
    navigate('/worlds')
  }

  // Define animation styles 
  const animatedBackgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(-45deg, rgba(156, 255, 109, 0.15), rgba(109, 194, 255, 0.15), rgba(156, 255, 109, 0.1), rgba(109, 194, 255, 0.1))',
    backgroundSize: '400% 400%',
    animation: 'gradient 15s ease infinite',
    zIndex: 0,
  }

  return (
    <div className="page-container relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Discover Who You'll Become, What You'll Do, and Where Your Story Unfolds.
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300">
            An AI-powered 3D universe where every detail—avatars, actions, and worlds—comes to life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button 
              className="btn btn-primary text-lg px-8 py-4"
              onClick={handleGetStarted}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Step Into Your Story'}
            </button>
            <button 
              className="btn btn-secondary text-lg px-8 py-4"
              onClick={handleExploreAsGuest}
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Who - Avatars Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Who Will You Be?</h2>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            Craft your perfect avatar or meet AI-generated characters with unique personalities and lifelike animations. 
            Seductive strangers, bold adventurers, or mysterious allies—choose your role.
          </p>
          <button className="btn btn-secondary mx-auto block">Customize Now</button>
        </div>
      </section>

      {/* What - Action & Story Section */}
      <section className="py-16 px-4 bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">What Will You Experience?</h2>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            Dive into real-time 3D interactions and AI-crafted stories that twist with every choice. 
            Seduce, explore, or unravel secrets—the action is yours to shape.
          </p>
          <button className="btn btn-secondary mx-auto block">Explore Stories</button>
        </div>
      </section>

      {/* Where - Setting Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Where Will You Go?</h2>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            Step into creator-built worlds or AI-designed scenes—sultry nightclubs, shadowy mansions, 
            or futuristic escapes. Every setting pulls you deeper into the story.
          </p>
          <button className="btn btn-secondary mx-auto block">See the Worlds</button>
        </div>
      </section>

      {/* When - Era Section */}
      <section className="py-16 px-4 bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">When Does It Happen?</h2>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            From timeless fantasies to retro glamour or sci-fi seduction, pick your era or let the AI surprise you. 
            Every period adds a new layer to your adventure.
          </p>
          <button className="btn btn-secondary mx-auto block">Choose Your Time</button>
        </div>
      </section>

      {/* How - Tech Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">How Does It Come to Life?</h2>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            Powered by cutting-edge AI and motion capture, every move, word, and world feels real. 
            Seamless 3D visuals and creator tools bring your fantasies to the screen.
          </p>
          <button className="btn btn-secondary mx-auto block">Learn the Magic</button>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 px-4 bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl mb-8">
            Who, What, Where, When, How—your story starts here. Join creators and players in a universe unlike any other.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <button className="btn btn-primary" onClick={handleGetStarted}>Sign Up Now</button>
            <button className="btn btn-secondary">Join the Community</button>
            <button className="btn btn-secondary">Visit the Marketplace</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card p-6">
              <p className="italic">"The stories kept me hooked!"</p>
              <p className="text-sm text-gray-500 mt-2">- Early User</p>
            </div>
            <div className="card p-6">
              <p className="font-bold">500+ unique worlds created</p>
              <p className="text-sm text-gray-500 mt-2">and growing daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global CSS for animation keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
    </div>
  )
}
