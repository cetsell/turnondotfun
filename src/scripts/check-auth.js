#!/usr/bin/env node

/**
 * Authentication Checker
 * 
 * This script helps diagnose authentication issues by testing Supabase connections
 * and token validation. It can be used to verify that tokens are being properly
 * generated and validated.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('🔒 TurnOnDotFun Authentication Checker');
console.log('=====================================\n');

// Verify Supabase settings
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('Make sure SUPABASE_URL and SUPABASE_KEY are set correctly');
  process.exit(1);
}

// Function to test Supabase connection
async function testSupabaseConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    console.log('✅ Supabase module loaded successfully');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase client created');
    
    console.log('\nTesting connection to Supabase...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log(`✅ API URL: ${SUPABASE_URL}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
    return false;
  }
}

// Function to test authentication with a token
async function testAuthWithToken(token) {
  if (!token) {
    console.log('⚠️ No token provided. Skipping token test.');
    return false;
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    console.log('\nTesting authentication with provided token...');
    
    console.log('Method 1: Using getUser()');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.log('❌ getUser failed:', userError.message);
    } else if (userData && userData.user) {
      console.log('✅ getUser succeeded!');
      console.log(`- User ID: ${userData.user.id}`);
      console.log(`- Email: ${userData.user.email}`);
    } else {
      console.log('❌ getUser returned no data');
    }
    
    console.log('\nMethod 2: Using getSession()');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession(token);
    
    if (sessionError) {
      console.log('❌ getSession failed:', sessionError.message);
    } else if (sessionData && sessionData.session && sessionData.session.user) {
      console.log('✅ getSession succeeded!');
      console.log(`- User ID: ${sessionData.session.user.id}`);
      console.log(`- Email: ${sessionData.session.user.email}`);
    } else {
      console.log('❌ getSession returned no data');
    }
    
    return !userError || !sessionError;
  } catch (error) {
    console.error('❌ Error testing authentication:', error);
    return false;
  }
}

// Function to validate WebSocket URL
function validateWebSocketUrl() {
  const wsUrl = process.env.PUBLIC_WS_URL;
  
  if (!wsUrl) {
    console.log('⚠️ PUBLIC_WS_URL not set in .env file. It will be derived from PORT.');
    return false;
  }
  
  if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    console.error('❌ PUBLIC_WS_URL must use WebSocket protocol (ws:// or wss://)');
    console.error(`Current value: ${wsUrl}`);
    return false;
  }
  
  console.log('✅ WebSocket URL format is valid:', wsUrl);
  return true;
}

// Main function
async function main() {
  // Get token from command line args if provided
  let token = null;
  const tokenArg = process.argv.find(arg => arg.startsWith('--token='));
  if (tokenArg) {
    token = tokenArg.split('=')[1];
    console.log(`Token provided (length: ${token.length})`);
  }
  
  // Test suite
  const connSuccess = await testSupabaseConnection();
  validateWebSocketUrl();
  
  if (connSuccess && token) {
    await testAuthWithToken(token);
  }
  
  console.log('\n🔍 Authentication Check Complete');
  console.log('\nTo use this script with a token:');
  console.log('  npm run check-auth -- --token=YOUR_TOKEN');
}

main().catch(error => {
  console.error('Error running authentication check:', error);
  process.exit(1);
});
