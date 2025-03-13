/**
 * Avatar customization API routes
 */

async function avatarRoutes(fastify) {
  /**
   * Get available avatar assets
   */
  fastify.get('/api/avatar/assets', async (request, reply) => {
    try {
      // Authenticate user
      let user = null;
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ') && fastify.supabase) {
        try {
          const token = authHeader.substring(7);
          const { data, error } = await fastify.supabase.auth.getUser(token);
          if (!error) {
            user = data.user;
          } else {
            return reply.code(401).send({ error: 'Authentication failed' });
          }
        } catch (error) {
          console.error('Error authenticating user:', error);
          return reply.code(401).send({ error: 'Authentication failed' });
        }
      } else {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      
      // Fetch avatar assets from Supabase
      const { data, error } = await fastify.supabase
        .from('avatar_assets')
        .select('*');
        
      if (error) {
        console.error('Error fetching avatar assets:', error);
        return reply.code(500).send({ error: 'Failed to fetch avatar assets' });
      }
      
      return reply.code(200).send(data);
    } catch (err) {
      console.error('Avatar assets endpoint error:', err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  /**
   * Get specific avatar asset by ID
   */
  fastify.get('/api/avatar/asset/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      if (!id) {
        return reply.code(400).send({ error: 'Asset ID is required' });
      }
      
      // Fetch avatar asset from Supabase
      const { data, error } = await fastify.supabase
        .from('avatar_assets')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching avatar asset ${id}:`, error);
        return reply.code(404).send({ error: 'Asset not found' });
      }
      
      return reply.code(200).send(data);
    } catch (err) {
      console.error('Get avatar asset endpoint error:', err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  /**
   * Get user's avatar configuration
   */
  fastify.get('/api/avatar/config', async (request, reply) => {
    try {
      // Authenticate user
      let user = null;
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ') && fastify.supabase) {
        try {
          const token = authHeader.substring(7);
          const { data, error } = await fastify.supabase.auth.getUser(token);
          if (!error) {
            user = data.user;
          } else {
            return reply.code(401).send({ error: 'Authentication failed' });
          }
        } catch (error) {
          console.error('Error authenticating user:', error);
          return reply.code(401).send({ error: 'Authentication failed' });
        }
      } else {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      
      // Fetch user's avatar configuration from Supabase
      const { data, error } = await fastify.supabase
        .from('user_avatars')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        // If no avatar configuration exists yet, return 404
        if (error.code === 'PGSQL_ERROR_NO_DATA') {
          return reply.code(404).send({ error: 'Avatar configuration not found' });
        }
        
        console.error('Error fetching user avatar config:', error);
        return reply.code(500).send({ error: 'Failed to fetch avatar configuration' });
      }
      
      return reply.code(200).send(data);
    } catch (err) {
      console.error('Get avatar config endpoint error:', err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  /**
   * Save user's avatar configuration
   */
  fastify.post('/api/avatar/config', async (request, reply) => {
    try {
      // Authenticate user
      let user = null;
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ') && fastify.supabase) {
        try {
          const token = authHeader.substring(7);
          const { data, error } = await fastify.supabase.auth.getUser(token);
          if (!error) {
            user = data.user;
          } else {
            return reply.code(401).send({ error: 'Authentication failed' });
          }
        } catch (error) {
          console.error('Error authenticating user:', error);
          return reply.code(401).send({ error: 'Authentication failed' });
        }
      } else {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      
      // Validate required fields
      const { 
        base_model, 
        avatar_url,
        skin_texture,
        hair_model,
        hair_color,
        clothing_top,
        clothing_bottom,
        clothing_shoes,
        accessories
      } = request.body;
      
      if (!base_model) {
        return reply.code(400).send({ error: 'Base model is required' });
      }
      
      // Prepare data for upsert
      const avatarData = {
        id: user.id,
        base_model,
        avatar_url,
        skin_texture,
        hair_model,
        hair_color,
        clothing_top,
        clothing_bottom,
        clothing_shoes,
        accessories: accessories || [],
        updated_at: new Date().toISOString()
      };
      
      // Check if record exists
      const { data: existingData, error: existingError } = await fastify.supabase
        .from('user_avatars')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (existingError && existingError.code !== 'PGSQL_ERROR_NO_DATA') {
        console.error('Error checking existing avatar:', existingError);
        return reply.code(500).send({ error: 'Failed to check existing avatar' });
      }
      
      // For a new record, add created_at
      if (!existingData) {
        avatarData.created_at = avatarData.updated_at;
      }
      
      // Save to Supabase
      const { error } = await fastify.supabase
        .from('user_avatars')
        .upsert(avatarData);
        
      if (error) {
        console.error('Error saving avatar configuration:', error);
        return reply.code(500).send({ error: 'Failed to save avatar configuration' });
      }
      
      return reply.code(200).send({ success: true, id: user.id });
    } catch (err) {
      console.error('Save avatar config endpoint error:', err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

module.exports = avatarRoutes; 