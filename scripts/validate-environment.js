#!/usr/bin/env node

/**
 * Environment validation script for SMS notification system
 * Validates all required environment variables and external service connections
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating SMS Notification System Environment...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Check if .env.twilio exists and source it
const twilioEnvPath = path.join(process.cwd(), '.env.twilio');
if (fs.existsSync(twilioEnvPath)) {
  const twilioEnv = fs.readFileSync(twilioEnvPath, 'utf8');
  const lines = twilioEnv.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('export ')) {
      const [key, value] = line.replace('export ', '').split('=');
      if (key && value) {
        process.env[key] = value.replace(/"/g, '');
      }
    }
  });
}

// Required environment variables
const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase Anonymous Key',
  'TWILIO_ACCOUNT_SID': 'Twilio Account SID',
  'TWILIO_API_KEY': 'Twilio API Key',
  'TWILIO_API_SECRET': 'Twilio API Secret',
  'TWILIO_PHONE_NUMBER': 'Twilio Phone Number',
  'NEXT_PUBLIC_APP_URL': 'Application URL',
};

// Optional but recommended variables
const optionalVars = {
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase Service Role Key',
  'CRON_SECRET': 'Cron Secret Key',
  'DATABASE_URL': 'Database URL',
};

let hasErrors = false;

// Check required variables
console.log('📋 Checking Required Environment Variables:');
Object.entries(requiredVars).forEach(([key, description]) => {
  if (process.env[key]) {
    console.log(`  ✅ ${description}: Configured`);
  } else {
    console.log(`  ❌ ${description}: MISSING`);
    hasErrors = true;
  }
});

console.log('\n📋 Checking Optional Environment Variables:');
Object.entries(optionalVars).forEach(([key, description]) => {
  if (process.env[key]) {
    console.log(`  ✅ ${description}: Configured`);
  } else {
    console.log(`  ⚠️  ${description}: Not configured (recommended)`);
  }
});

// Validate environment variable formats
console.log('\n🔍 Validating Environment Variable Formats:');

// Validate Supabase URL
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
    console.log('  ✅ Supabase URL format: Valid');
  } else {
    console.log('  ❌ Supabase URL format: Invalid');
    hasErrors = true;
  }
}

// Validate Twilio Phone Number
if (process.env.TWILIO_PHONE_NUMBER) {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (phoneNumber.match(/^\+1\d{10}$/)) {
    console.log('  ✅ Twilio Phone Number format: Valid');
  } else {
    console.log('  ❌ Twilio Phone Number format: Invalid (should be +1XXXXXXXXXX)');
    hasErrors = true;
  }
}

// Validate Application URL
if (process.env.NEXT_PUBLIC_APP_URL) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl.match(/^https?:\/\/.+/)) {
    console.log('  ✅ Application URL format: Valid');
  } else {
    console.log('  ❌ Application URL format: Invalid');
    hasErrors = true;
  }
}

// Test external connections
console.log('\n🌐 Testing External Service Connections:');

async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('  ❌ Supabase Connection: Failed -', error.message);
      return false;
    } else {
      console.log('  ✅ Supabase Connection: Success');
      return true;
    }
  } catch (error) {
    console.log('  ❌ Supabase Connection: Failed -', error.message);
    return false;
  }
}

async function testTwilioConnection() {
  try {
    const twilio = require('twilio');
    
    // Try with account SID and auth token first
    let client;
    if (process.env.TWILIO_AUTH_TOKEN) {
      client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } else if (process.env.TWILIO_API_KEY && process.env.TWILIO_API_SECRET) {
      client = twilio(
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        { accountSid: process.env.TWILIO_ACCOUNT_SID }
      );
    } else {
      console.log('  ❌ Twilio Connection: Missing auth credentials');
      return false;
    }
    
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    if (account.status === 'active') {
      console.log('  ✅ Twilio Connection: Success');
      return true;
    } else {
      console.log('  ❌ Twilio Connection: Account not active, status:', account.status);
      return false;
    }
  } catch (error) {
    console.log('  ❌ Twilio Connection: Failed -', error.message);
    return false;
  }
}

async function runConnectionTests() {
  const supabaseOk = await testSupabaseConnection();
  const twilioOk = await testTwilioConnection();
  
  if (!supabaseOk || !twilioOk) {
    hasErrors = true;
  }
  
  // Check database migrations
  console.log('\n📊 Checking Database Schema:');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Check if SMS notification tables exist
    const tables = [
      'users',
      'notification_preferences', 
      'notifications_log',
      'event_messages'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`  ❌ Table '${table}': Missing or inaccessible`);
        hasErrors = true;
      } else {
        console.log(`  ✅ Table '${table}': Available`);
      }
    }
  } catch (error) {
    console.log('  ❌ Database Schema Check: Failed -', error.message);
    hasErrors = true;
  }
  
  // Summary
  console.log('\n📋 Environment Validation Summary:');
  if (hasErrors) {
    console.log('  ❌ Environment validation failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('  ✅ Environment validation passed. SMS notification system is ready!');
  }
}

runConnectionTests().catch(error => {
  console.error('Environment validation failed:', error);
  process.exit(1);
});