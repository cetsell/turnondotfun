import 'ses'
import '../core/lockdown'
import './bootstrap'

import fs from 'fs-extra'
import path from 'path'
import { pipeline } from 'stream/promises'
import Fastify from 'fastify'
import ws from '@fastify/websocket'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import statics from '@fastify/static'
import multipart from '@fastify/multipart'

import { loadPhysX } from './physx/loadPhysX'
import { hashFile } from '../core/utils-server'
import { getDB } from './db'
import { Storage } from './Storage'
import { WorldsManager } from './WorldsManager'

const rootDir = path.join(__dirname, '../')
const port = process.env.PORT

// Create worlds directory if it doesn't exist
const worldsDir = path.join(rootDir, 'worlds')
await fs.ensureDir(worldsDir)

// Set up default world directory
const defaultWorldDir = path.join(worldsDir, 'default')
const defaultAssetsDir = path.join(defaultWorldDir, '/assets')
await fs.ensureDir(defaultWorldDir)
await fs.ensureDir(defaultAssetsDir)

// Copy core assets to default world
await fs.copy(path.join(rootDir, 'src/core/assets'), defaultAssetsDir, { overwrite: false })

// Set up database
const db = await getDB(path.join(defaultWorldDir, '/db.sqlite'))

// Create and initialize the worlds manager
const worldsManager = new WorldsManager(rootDir)
await worldsManager.init({ db, loadPhysX, Storage })

const fastify = Fastify({ logger: { level: 'error' } })

fastify.register(cors)
fastify.register(compress)

// Serve static files
fastify.register(statics, {
  root: path.join(process.cwd(), 'build/public'),
  prefix: '/',
  decorateReply: false,
  setHeaders: res => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
})

// Catch-all route to serve index.html for client-side routing
fastify.setNotFoundHandler(async (request, reply) => {
  // If the request starts with /api, it's a missing API route
  if (request.url.startsWith('/api')) {
    return reply.code(404).send({ error: 'API route not found' })
  }
  
  // For all other routes, serve the index.html
  const indexPath = path.join(__dirname, 'public', 'index.html')
  try {
    const content = await fs.readFile(indexPath, 'utf8')
    reply.type('text/html').send(content)
  } catch (error) {
    reply.code(500).send({ error: 'Error serving index.html' })
  }
})

fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
})
fastify.register(ws)
fastify.register(worldNetwork)

const publicEnvs = {}
for (const key in process.env) {
  if (key.startsWith('PUBLIC_')) {
    const value = process.env[key]
    publicEnvs[key] = value
  }
}
const envsCode = `
  if (!globalThis.process) globalThis.process = {}
  globalThis.process.env = ${JSON.stringify(publicEnvs)}
`
fastify.get('/env.js', async (req, reply) => {
  reply.type('application/javascript').send(envsCode)
})

// API Routes for World Management

// List all worlds
fastify.get('/api/worlds', async (request, reply) => {
  try {
    // Get worlds from WorldsManager
    const worlds = await worldsManager.listWorlds()
    return reply.send({ worlds })
  } catch (error) {
    console.error('Error in /api/worlds:', error)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

// Create a new world
fastify.post('/api/worlds', async (request, reply) => {
  try {
    // Get authentication info if provided
    let user = null
    const authHeader = request.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ') && worldsManager.supabase) {
      try {
        const token = authHeader.substring(7)
        const { data, error } = await worldsManager.supabase.auth.getUser(token)
        if (!error) {
          user = data.user
        }
      } catch (error) {
        console.error('Error authenticating user:', error)
        // Continue without authentication
      }
    }
    
    // Validate required fields
    const { title, description, isPublic = true } = request.body
    
    if (!title) {
      return reply.code(400).send({ error: 'World title is required' })
    }
    
    // Generate a unique ID for the world
    const worldId = title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36)
    
    // Create the world in Supabase if available
    if (worldsManager.supabase) {
      try {
        console.log('Creating world in Supabase:', worldId)
        const { error } = await worldsManager.supabase.from('worlds').insert({
          id: worldId,
          title,
          description: description || '',
          is_public: isPublic,
          created_by: user ? user.id : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        if (error) {
          console.error('Error creating world in Supabase:', error)
          // Continue anyway to create the world in memory
        } else {
          // Add to predefined worlds
          worldsManager.predefinedWorlds.add(worldId)
        }
      } catch (error) {
        console.error('Error creating world in Supabase:', error)
        // Continue anyway to create the world in memory
      }
    }
    
    // Create the world in the WorldsManager
    try {
      const world = await worldsManager.createWorld(worldId)
      
      // Return the created world
      return reply.code(201).send({
        world: {
          id: worldId,
          name: title,
          description: description || '',
          isPublic: isPublic,
          active: true,
          isPredefined: true,
          createdBy: user ? user.id : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error(`Error creating world ${worldId}:`, error)
      return reply.code(500).send({ error: 'Failed to create world' })
    }
  } catch (error) {
    console.error('Error creating world:', error)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

// Get a specific world
fastify.get('/api/worlds/:id', async (request, reply) => {
  try {
    const worldId = request.params.id
    
    // Check if world exists in memory
    const inMemory = worldsManager.worlds.has(worldId)
    const worldInstance = inMemory ? worldsManager.getWorld(worldId) : null
    
    // If it's the default world, we can skip the database check
    if (worldId === 'default') {
      const worldWithStatus = {
        id: 'default',
        name: 'Default World',
        description: 'The main world',
        isPublic: true,
        active: inMemory,
        isPredefined: true,
        connected: inMemory && worldInstance ? (worldInstance.connections || 0) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return reply.send({ world: worldWithStatus })
    }
    
    // Try to get the world from Supabase
    let worldData = null
    
    if (worldsManager.supabase) {
      try {
        const { data, error } = await worldsManager.supabase
          .from('worlds')
          .select('id, title, description, is_public, created_at, updated_at, created_by')
          .eq('id', worldId)
          .single()
        
        if (!error && data) {
          worldData = {
            id: data.id,
            name: data.title,
            description: data.description || '',
            isPublic: data.is_public,
            isPredefined: worldsManager.predefinedWorlds.has(data.id),
            active: inMemory,
            connected: inMemory && worldInstance ? (worldInstance.connections || 0) : 0,
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }
        }
      } catch (error) {
        console.error(`Error fetching world ${worldId} from Supabase:`, error)
        // Continue to check if world exists on disk
      }
    }
    
    if (worldData) {
      return reply.send({ world: worldData })
    }
    
    // If we get here, the world doesn't exist
    return reply.code(404).send({ error: 'World not found' })
  } catch (error) {
    console.error(`Error fetching world:`, error)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

// Get active sessions for a world
fastify.get('/api/worlds/:id/sessions', async (request, reply) => {
  try {
    const worldId = request.params.id
    
    // Check if world exists
    const worldExists = worldsManager.worlds.has(worldId) || worldsManager.predefinedWorlds.has(worldId)
    
    if (!worldExists) {
      return reply.code(404).send({ error: 'World not found' })
    }
    
    // Get active sessions from Supabase
    if (worldsManager.supabase) {
      try {
        // Adapt this query to match your existing game_Sessions table structure
        const { data, error } = await worldsManager.supabase
          .from('game_Sessions')
          .select(`
            id, 
            user_id,
            start_time,
            end_time,
            is_active,
            users (id, email, user_metadata)
          `)
          .eq('world_id', worldId)
          .eq('is_active', true)
        
        if (error) {
          console.error(`Error fetching sessions for world ${worldId}:`, error)
          return reply.code(500).send({ error: 'Failed to fetch sessions' })
        }
        
        // Format the sessions based on your table structure
        const sessions = data.map(session => ({
          id: session.id,
          userId: session.user_id,
          userName: session.users?.user_metadata?.name || 'Anonymous',
          startTime: session.start_time,
          duration: session.end_time ? 
            (new Date(session.end_time) - new Date(session.start_time)) / 1000 : 
            (new Date() - new Date(session.start_time)) / 1000
        }))
        
        return reply.send({ sessions })
      } catch (error) {
        console.error(`Error fetching sessions for world ${worldId}:`, error)
        return reply.code(500).send({ error: 'Failed to fetch sessions' })
      }
    } else {
      // If Supabase is not available, return empty array
      return reply.send({ sessions: [] })
    }
  } catch (error) {
    console.error(`Error fetching world sessions:`, error)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

// Delete a world
fastify.delete('/api/worlds/:id', async (request, reply) => {
  try {
    const worldId = request.params.id
    
    if (worldId === 'default') {
      return reply.code(400).send({ error: 'Cannot delete the default world' })
    }
    
    // Get authentication info if provided
    let user = null
    const authHeader = request.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ') && worldsManager.supabase) {
      try {
        const token = authHeader.substring(7)
        const { data, error } = await worldsManager.supabase.auth.getUser(token)
        if (!error) {
          user = data.user
        }
      } catch (error) {
        console.error('Error authenticating user:', error)
      }
    }
    
    // Check if the world exists in Supabase
    let canDelete = true
    if (worldsManager.supabase) {
      try {
        const { data: world, error: fetchError } = await worldsManager.supabase
          .from('worlds')
          .select('created_by')
          .eq('id', worldId)
          .single()
        
        if (fetchError) {
          // World not found in database, but might exist on disk
          console.log(`World ${worldId} not found in database`)
        } else if (world.created_by && user && world.created_by !== user.id) {
          // Only the creator can delete the world if it has a creator
          return reply.code(403).send({ error: 'You are not authorized to delete this world' })
        }
      } catch (error) {
        console.error('Error checking world in database:', error)
      }
    }
    
    // Remove the world from memory if it's loaded
    if (worldsManager.worlds.has(worldId)) {
      worldsManager.removeWorld(worldId)
    }
    
    // Delete from database if Supabase is available
    if (worldsManager.supabase) {
      try {
        const { error: deleteError } = await worldsManager.supabase
          .from('worlds')
          .delete()
          .eq('id', worldId)
        
        if (deleteError) {
          console.error('Error deleting world from database:', deleteError)
          // Continue with the operation even if database deletion fails
        }
      } catch (error) {
        console.error('Error deleting world from database:', error)
        // Continue with the operation even if database deletion fails
      }
    }
    
    return reply.send({ success: true, message: `World ${worldId} deleted successfully` })
  } catch (error) {
    console.error('Error deleting world:', error)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

fastify.post('/api/upload', async (req, reply) => {
  // console.log('DEBUG: slow uploads')
  // await new Promise(resolve => setTimeout(resolve, 2000))
  const file = await req.file()
  const ext = file.filename.split('.').pop().toLowerCase()
  // create temp buffer to store contents
  const chunks = []
  for await (const chunk of file.file) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)
  // hash from buffer
  const hash = await hashFile(buffer)
  const filename = `${hash}.${ext}`
  // save to fs
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  if (!exists) {
    await fs.writeFile(filePath, buffer)
  }
})

fastify.get('/api/upload-check', async (req, reply) => {
  const filename = req.query.filename
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  return { exists }
})

fastify.get('/health', async (request, reply) => {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }

    return reply.code(200).send(health)
  } catch (error) {
    console.error('Health check failed:', error)
    return reply.code(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
    })
  }
})

fastify.get('/status', async (request, reply) => {
  try {
    const worldId = request.query.worldId || 'default'
    const world = worldsManager.getWorld(worldId)
    
    if (!world) {
      return reply.code(404).send({
        status: 'error',
        message: `World ${worldId} not found`
      })
    }
    
    const status = {
      worldId,
      uptime: Math.round(world.time),
      protected: process.env.ADMIN_CODE !== undefined ? true : false,
      connectedUsers: [],
      commitHash: process.env.COMMIT_HASH,
    }
    
    if (world.network && world.network.sockets) {
      for (const socket of world.network.sockets.values()) {
        if (socket.player) {
          status.connectedUsers.push({
            id: socket.player.data.userId,
            position: socket.player.position.current.toArray(),
            name: socket.player.data.name,
          })
        }
      }
    }

    return reply.code(200).send(status)
  } catch (error) {
    console.error('Status failed:', error)
    return reply.code(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
    })
  }
})

// Authentication endpoints
// Login endpoint
fastify.post('/api/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body
    console.log(`Login attempt for email: ${email}`)
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password')
      return reply.code(400).send({ error: 'Email and password are required' })
    }
    
    if (!worldsManager.supabase) {
      console.log('Login failed: Supabase not available')
      return reply.code(500).send({ error: 'Authentication service unavailable' })
    }
    
    // Authenticate with Supabase
    console.log('Attempting Supabase authentication')
    const { data, error } = await worldsManager.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Supabase login error:', error)
      return reply.code(401).send({ error: error.message })
    }
    
    console.log('Login successful, returning session data')
    console.log('Session data:', {
      hasAccessToken: !!data.session?.access_token,
      hasRefreshToken: !!data.session?.refresh_token,
      userId: data.user?.id
    })
    
    // Return a simplified token response that's easier to handle
    return reply.code(200).send({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })
  } catch (err) {
    console.error('Login endpoint error:', err)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

// Signup endpoint
fastify.post('/api/auth/signup', async (request, reply) => {
  try {
    const { email, password } = request.body
    
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' })
    }
    
    if (!worldsManager.supabase) {
      return reply.code(500).send({ error: 'Authentication service unavailable' })
    }
    
    // Register with Supabase
    const { data, error } = await worldsManager.supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      console.error('Signup error:', error)
      return reply.code(400).send({ error: error.message })
    }
    
    // Return a simplified token response that's easier to handle
    return reply.code(200).send({
      token: data.session?.access_token || null,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })
  } catch (err) {
    console.error('Signup endpoint error:', err)
    return reply.code(500).send({ error: 'Internal server error' })
  }
})

// Email verification endpoint
fastify.get('/api/auth/verify', async (request, reply) => {
  try {
    const { token, type } = request.query
    
    if (!token || type !== 'email') {
      return reply.code(400).send({ error: 'Invalid verification parameters' })
    }
    
    if (!worldsManager.supabase) {
      return reply.code(500).send({ error: 'Authentication service unavailable' })
    }
    
    // Verify the email with Supabase
    const { error } = await worldsManager.supabase.auth.verifyOtp({
      token,
      type: 'email'
    })
    
    if (error) {
      console.error('Email verification error:', error)
      // Redirect to login page with error
      return reply.redirect('/?verificationError=' + encodeURIComponent(error.message))
    }
    
    // Redirect to the worlds page after successful verification
    return reply.redirect('/worlds')
  } catch (err) {
    console.error('Email verification endpoint error:', err)
    return reply.redirect('/?verificationError=Internal%20server%20error')
  }
})

// Get current user endpoint
fastify.get('/api/auth/me', async (request, reply) => {
  try {
    console.log('Auth check: Received /api/auth/me request');
    
    if (!worldsManager.supabase) {
      console.log('Auth check failed: Supabase not available');
      return reply.code(500).send({ error: 'Authentication service unavailable' });
    }
    
    // Get token from authorization header
    const authHeader = request.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Auth check: Found token in Authorization header');
    } else {
      console.log('Auth check: No token in Authorization header');
      return reply.code(401).send({ error: 'No authentication token provided' });
    }
    
    // Verify token is properly formatted
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.error('Auth check: Token is not a valid JWT format');
      return reply.code(401).send({ error: 'Invalid token format' });
    }
    
    // Get the user data using getUser with the token directly
    const { data: { user }, error } = await worldsManager.supabase.auth.getUser(token);
    
    if (error) {
      console.error('Auth check: User verification error:', error);
      return reply.code(401).send({ error: error.message });
    }
    
    if (!user) {
      console.log('Auth check: No user found with token');
      return reply.code(401).send({ error: 'User not found' });
    }
    
    console.log('Auth check: Successfully authenticated user');
    return reply.code(200).send({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Auth verification endpoint error:', err);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Catch-all route for client-side routing
// This must be registered after all API routes but before the error handler
fastify.get('*', { constraints: { host: 'localhost' } }, async (request, reply) => {
  // Skip API routes and websocket routes
  if (request.url.startsWith('/api/') || request.url.startsWith('/ws')) {
    return reply.callNotFound()
  }
  
  // List of known client-side routes that should serve index.html
  const clientRoutes = ['/worlds', '/avatar', '/login', '/signup'];
  const isClientRoute = clientRoutes.some(route => request.url === route || request.url.startsWith(route + '/'));
  
  // If it's a client route or the root path, serve index.html
  if (isClientRoute || request.url === '/') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    try {
      const content = await fs.readFile(indexPath, 'utf8');
      reply.type('text/html').send(content);
    } catch (error) {
      reply.code(500).send({ error: 'Error serving index.html' });
    }
    return;
  }
  
  // For all other paths, try to serve as static file or 404
  return reply.callNotFound();
})

fastify.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.status(500).send()
})

try {
  await fastify.listen({ port, host: '0.0.0.0' })
} catch (err) {
  console.error(err)
  console.error(`failed to launch on port ${port}`)
  process.exit(1)
}

async function worldNetwork(fastify) {
  fastify.get('/ws', { websocket: true }, (ws, req) => {
    const worldId = req.query.worldId || 'default'
    worldsManager.handleConnection(ws, req.query.authToken, worldId)
  })
}

console.log(`running on port ${port}`)

// Graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await worldsManager.shutdown()
  await fastify.close()
  process.exit(0)
})
