#!/usr/bin/env node

/**
 * Environment Checker
 * 
 * This script validates the environment configuration and checks for common issues
 * that might cause problems with the 3D game application.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('🔍 TurnOnDotFun Environment Checker');
console.log('==================================\n');

// Check required environment variables
const requiredVars = [
  'WORLD',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

const warnings = [];
const errors = [];

// Validate required variables
console.log('Checking required environment variables:');
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    errors.push(`Missing required environment variable: ${varName}`);
    console.log(`  ❌ ${varName}: Missing`);
  } else {
    console.log(`  ✅ ${varName}: Present`);
  }
});

// Check WebSocket URL
if (process.env.PUBLIC_WS_URL) {
  const wsUrl = process.env.PUBLIC_WS_URL;
  if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    errors.push('PUBLIC_WS_URL must use WebSocket protocol (ws:// or wss://)');
    console.log(`  ❌ PUBLIC_WS_URL: Invalid protocol - ${wsUrl}`);
  } else {
    console.log(`  ✅ PUBLIC_WS_URL: ${wsUrl}`);
  }
} else {
  console.log(`  ℹ️ PUBLIC_WS_URL: Not set, will be derived from PORT`);
}

// Check Supabase URL format
if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('supabase.co')) {
  warnings.push('SUPABASE_URL format might be incorrect');
  console.log(`  ⚠️ SUPABASE_URL: Format may be incorrect - ${process.env.SUPABASE_URL}`);
}

// Check for deprecated variables that might still be in use
if (process.env.JWT_SECRET) {
  warnings.push('JWT_SECRET is deprecated but still defined');
  console.log('  ⚠️ JWT_SECRET: Deprecated but still defined');
}

// Check world folder exists
const worldFolder = path.join(process.cwd(), 'worlds', process.env.WORLD || 'world');
if (!fs.existsSync(worldFolder)) {
  errors.push(`World folder does not exist: ${worldFolder}`);
  console.log(`  ❌ World folder: Not found - ${worldFolder}`);
} else {
  console.log(`  ✅ World folder: Found - ${worldFolder}`);
}

// Print summary
console.log('\nSummary:');
if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
}

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(error => console.log(`  ❌ ${error}`));
  console.log('\n❌ Environment check failed. Please fix the errors above.');
} else if (warnings.length > 0) {
  console.log('\n⚠️ Environment check passed with warnings. Consider addressing the warnings above.');
} else {
  console.log('\n✅ Environment check passed! Your configuration looks good.');
}

// Suggestions for common issues
console.log('\nCommon troubleshooting tips:');
console.log(' - If WebSocket connections fail, make sure PUBLIC_WS_URL uses the ws:// or wss:// protocol');
console.log(' - Ensure your Supabase project is properly set up and the keys are correct');
console.log(' - For authentication issues, check if Supabase tokens are being passed correctly');
console.log(' - If world loading fails, verify that the world folder exists and has the required files');
