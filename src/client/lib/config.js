// Ensure environment variables are available
const env = window.process?.env || {};

// Configuration object with defaults and validation
export const config = {
  // Core environment settings
  nodeEnv: env.NODE_ENV || 'development',
  isDev: (env.NODE_ENV || 'development') === 'development',
  
  // API endpoints
  wsUrl: env.PUBLIC_WS_URL || 'http://localhost:3000/ws',
  apiUrl: env.PUBLIC_API_URL || 'http://localhost:3000/api',
  assetsUrl: env.PUBLIC_ASSETS_URL || 'http://localhost:3000/assets',
  
  // Supabase configuration
  supabaseUrl: env.SUPABASE_URL,
  supabaseKey: env.SUPABASE_KEY || env.SUPABASE_ANON_KEY,
  
  // Helper method to validate configuration
  validate() {
    const issues = [];
    
    if (!this.supabaseUrl) {
      issues.push('SUPABASE_URL is missing');
    }
    
    if (!this.supabaseKey) {
      issues.push('SUPABASE_KEY/SUPABASE_ANON_KEY is missing');
    }
    
    if (!this.apiUrl) {
      issues.push('PUBLIC_API_URL is missing');
    }
    
    if (!this.wsUrl) {
      issues.push('PUBLIC_WS_URL is missing');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
};

// Validate configuration and log results
const validation = config.validate();
if (!validation.isValid) {
  console.error('Configuration issues detected:', validation.issues);
}

// Log the configuration for debugging (with sensitive data masked)
console.log('Application Configuration:', {
  environment: config.nodeEnv,
  endpoints: {
    ws: config.wsUrl,
    api: config.apiUrl,
    assets: config.assetsUrl
  },
  supabase: {
    url: config.supabaseUrl,
    keyLength: config.supabaseKey ? config.supabaseKey.length : 0,
    // Don't log the full key for security reasons
    keyPrefix: config.supabaseKey ? `${config.supabaseKey.substring(0, 10)}...` : 'undefined'
  }
});

export default config;
