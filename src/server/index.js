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

import { createServerWorld } from '../core/createServerWorld'
import { hashFile } from '../core/utils-server'
import { getDB } from './db'
import { authMiddleware } from './middleware/authMiddleware'

const rootDir = path.join(__dirname, '../')
const worldDir = path.join(rootDir, process.env.WORLD)
const assetsDir = path.join(worldDir, '/assets')
const port = process.env.PORT

await fs.ensureDir(worldDir)
await fs.ensureDir(assetsDir)

// copy core assets
await fs.copy(path.join(rootDir, 'src/core/assets'), path.join(assetsDir))

const db = await getDB(path.join(worldDir, '/db.sqlite'))

const world = createServerWorld()
world.init({ db, loadPhysX })

// Create the server
const fastify = Fastify({
  logger: false,
  maxParamLength: 1000,
})

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true,
})
fastify.register(compress)
fastify.register(multipart, {
  limits: {
    fileSize: parseInt(process.env.PUBLIC_MAX_UPLOAD_SIZE || '12') * 1024 * 1024,
  },
})
fastify.register(statics, {
  root: assetsDir,
  prefix: '/assets/',
  decorateReply: false,
})

// Serve static files from the public directory
fastify.register(statics, {
  root: path.join(rootDir, 'build/public'),
  prefix: '/',
  decorateReply: false,
})

fastify.register(ws)

// Register world network handler (protected by auth)
fastify.register(async function (fastify) {
  // Apply auth middleware to all routes in this context
  fastify.addHook('preHandler', authMiddleware)
  
  // Register the world network handler
  fastify.register(worldNetwork)
  
  // Protected API routes
  fastify.post('/api/upload', async (request, reply) => {
    try {
      const data = await request.file()
      const buffer = await data.toBuffer()
      const hash = await hashFile(buffer)
      const ext = path.extname(data.filename).toLowerCase()
      const filename = `${hash}${ext}`
      const filepath = path.join(assetsDir, filename)
      await fs.writeFile(filepath, buffer)
      return reply.code(200).send({
        hash,
        url: `/assets/${filename}`,
      })
    } catch (err) {
      console.error('upload failed:', err)
      return reply.code(500).send({
        error: 'Upload failed',
      })
    }
  })
})

// Public routes (no auth required)
fastify.get('/', async (request, reply) => {
  // Serve the client's index.html file
  const indexPath = path.join(rootDir, 'build/public/index.html')
  const content = await fs.readFile(indexPath, 'utf8')
  return reply.type('text/html').send(content)
})

// Add specific routes for client-side routing
fastify.get('/verify', async (request, reply) => {
  const indexPath = path.join(rootDir, 'build/public/index.html')
  const content = await fs.readFile(indexPath, 'utf8')
  return reply.type('text/html').send(content)
})

fastify.get('/reset-password', async (request, reply) => {
  const indexPath = path.join(rootDir, 'build/public/index.html')
  const content = await fs.readFile(indexPath, 'utf8')
  return reply.type('text/html').send(content)
})

fastify.get('/auth/callback', async (request, reply) => {
  const indexPath = path.join(rootDir, 'build/public/index.html')
  const content = await fs.readFile(indexPath, 'utf8')
  return reply.type('text/html').send(content)
})

fastify.get('/api/auth-check', async (request, reply) => {
  try {
    // Create a temporary Supabase client to check auth
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )
    
    // Get the session cookie or authorization header
    const authHeader = request.headers.authorization
    const token = authHeader ? authHeader.replace('Bearer ', '') : null
    
    let isAuthenticated = false
    let userData = null
    
    if (token) {
      // Verify the token
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data.user) {
        isAuthenticated = true
        userData = data.user
      }
    } else {
      // Check for session using Supabase's getSession
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session) {
        isAuthenticated = true
        userData = data.session.user
      }
    }
    
    return reply.code(200).send({
      isAuthenticated,
      user: userData ? {
        id: userData.id,
        email: userData.email
      } : null
    })
  } catch (error) {
    console.error('Auth check failed:', error)
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An error occurred while checking authentication'
    })
  }
})

fastify.get('/status', async (request, reply) => {
  try {
    const status = {
      uptime: Math.round(world.time),
      protected: process.env.ADMIN_CODE !== undefined ? true : false,
      requiresAuth: true, // Add this flag to indicate auth is required
      connectedUsers: [],
      commitHash: process.env.COMMIT_HASH,
    }
    for (const socket of world.network.sockets.values()) {
      status.connectedUsers.push({
        id: socket.player.data.userId,
        position: socket.player.position.current.toArray(),
        name: socket.player.data.name,
      })
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

try {
  await fastify.listen({ port, host: '0.0.0.0' })
} catch (err) {
  console.error(err)
  console.error(`failed to launch on port ${port}`)
  process.exit(1)
}

async function worldNetwork(fastify) {
  fastify.get('/ws', { websocket: true }, (ws, req) => {
    // The user is already authenticated by the authMiddleware
    // Pass the user ID from the request to the connection
    world.network.onConnection(ws, req.query.authToken, req.user)
  })
}

console.log(`running on port ${port}`)

// Graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await fastify.close()
  process.exit(0)
})
