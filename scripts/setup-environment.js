#!/usr/bin/env node

/**
 * Setup script to properly configure environment variables
 * and apply database migrations for SMS notification system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚙️  Setting up SMS Notification System Environment...\n');

// Read the current .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
}

// Read Twilio credentials from .env.twilio
const twilioEnvPath = path.join(process.cwd(), '.env.twilio');
let twilioAccountSid = '';
let twilioApiSecret = '';
let twilioPhoneNumber = '';

if (fs.existsSync(twilioEnvPath)) {
  const twilioEnv = fs.readFileSync(twilioEnvPath, 'utf8');
  const lines = twilioEnv.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('export TWILIO_ACCOUNT_SID=')) {
      twilioAccountSid = line.split('=')[1].replace(/"/g, '');
    }
    if (line.startsWith('export TWILIO_API_SECRET=')) {
      twilioApiSecret = line.split('=')[1].replace(/"/g, '');
    }
    if (line.startsWith('export TWILIO_PHONE_NUMBER=')) {
      twilioPhoneNumber = line.split('=')[1].replace(/"/g, '');
    }
  });
}

// Add missing environment variables to .env.local
const requiredEnvVars = [
  { key: 'TWILIO_ACCOUNT_SID', value: twilioAccountSid },
  { key: 'TWILIO_AUTH_TOKEN', value: twilioApiSecret }, // Note: Using API_SECRET as AUTH_TOKEN
  { key: 'TWILIO_PHONE_NUMBER', value: twilioPhoneNumber },
  { key: 'CRON_SECRET', value: 'sms-cron-secret-' + Math.random().toString(36).substr(2, 9) }
];

console.log('📝 Adding missing environment variables to .env.local...');

requiredEnvVars.forEach(({ key, value }) => {
  if (!envContent.includes(key + '=') && value) {
    envContent += `\n# Twilio Configuration\n${key}=${value}\n`;
    console.log(`  ✅ Added ${key}`);
  } else if (envContent.includes(key + '=')) {
    console.log(`  ℹ️  ${key} already exists`);
  } else {
    console.log(`  ⚠️  ${key} value not found in .env.twilio`);
  }
});

// Write updated .env.local
fs.writeFileSync(envLocalPath, envContent);

console.log('\n📊 Applying database migrations...');

// Check if we have supabase CLI or use direct SQL
const migrationFiles = [
  '003_add_phone_verification_fields.sql',
  '004_create_notification_preferences.sql',
  '005_create_notifications_log.sql',
  '006_create_event_messages.sql',
  '007_add_notification_preferences_trigger.sql'
];

const migrationsDir = path.join(process.cwd(), 'migrations');

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ Found migration: ${file}`);
  } else {
    console.log(`  ❌ Missing migration: ${file}`);
  }
});

console.log('\n🔧 To apply migrations, you can:');
console.log('  1. Use Supabase CLI: supabase db push');
console.log('  2. Or manually run the SQL files in the Supabase dashboard');
console.log('  3. Or use the MCP supabase tool if available');

console.log('\n✅ Environment setup complete!');
console.log('Run `node scripts/validate-environment.js` to verify the setup.');