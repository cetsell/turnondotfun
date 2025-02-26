import { createClient } from '@supabase/supabase-js'

export async function authMiddleware(request, reply) {
  // Create Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  try {
    // Get the session cookie or authorization header
    const authHeader = request.headers.authorization
    const token = authHeader ? authHeader.replace('Bearer ', '') : null
    
    // If no token is provided, check for cookie-based session
    if (!token) {
      // Check for session using Supabase's getSession
      const { data, error } = await supabase.auth.getSession()
      
      if (error || !data.session) {
        // No valid session found
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required to access this resource'
        })
      }
      
      // Add user data to request for use in route handlers
      request.user = data.session.user
    } else {
      // Verify the token
      const { data, error } = await supabase.auth.getUser(token)
      
      if (error || !data.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        })
      }
      
      // Add user data to request for use in route handlers
      request.user = data.user
    }
    
    // Continue to the route handler
    return
  } catch (error) {
    console.error('Auth middleware error:', error)
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An error occurred while authenticating'
    })
  }
} 