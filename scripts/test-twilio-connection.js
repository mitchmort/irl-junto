#!/usr/bin/env node

/**
 * Test Twilio connection with different credential methods
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Load Twilio environment
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

console.log('🔍 Testing Twilio Connection Methods...\n');

async function testMethod1() {
  console.log('Method 1: Using Account SID + Auth Token');
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('  ✅ Success! Account Status:', account.status);
    console.log('  📞 Account Name:', account.friendlyName);
    return true;
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    return false;
  }
}

async function testMethod2() {
  console.log('\nMethod 2: Using API Key + API Secret');
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { accountSid: process.env.TWILIO_ACCOUNT_SID }
    );
    
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('  ✅ Success! Account Status:', account.status);
    console.log('  📞 Account Name:', account.friendlyName);
    return true;
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    return false;
  }
}

async function testSMSSending() {
  console.log('\nMethod 3: Test SMS Sending (dry run)');
  try {
    const twilio = require('twilio');
    
    // Try with auth token first
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
      console.log('  ❌ No valid credentials found');
      return false;
    }
    
    // Get available phone numbers to verify we can make API calls
    const phoneNumbers = await client.availablePhoneNumbers('US').local.list({limit: 1});
    console.log('  ✅ API access confirmed! Found', phoneNumbers.length, 'available numbers');
    
    // Test validation of our Twilio phone number
    const validatedNumber = await client.lookups.v1.phoneNumbers(process.env.TWILIO_PHONE_NUMBER).fetch();
    console.log('  ✅ Twilio phone number validated:', validatedNumber.phoneNumber);
    
    return true;
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('📋 Available Credentials:');
  console.log('  Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'Available' : 'Missing');
  console.log('  Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'Available' : 'Missing');
  console.log('  API Key:', process.env.TWILIO_API_KEY ? 'Available' : 'Missing');
  console.log('  API Secret:', process.env.TWILIO_API_SECRET ? 'Available' : 'Missing');
  console.log('  Phone Number:', process.env.TWILIO_PHONE_NUMBER ? 'Available' : 'Missing');
  console.log('');
  
  const method1Success = await testMethod1();
  const method2Success = await testMethod2();
  const smsTestSuccess = await testSMSSending();
  
  console.log('\n📋 Test Results Summary:');
  console.log('  Method 1 (SID + Auth Token):', method1Success ? '✅ Success' : '❌ Failed');
  console.log('  Method 2 (API Key + Secret):', method2Success ? '✅ Success' : '❌ Failed');
  console.log('  SMS API Test:', smsTestSuccess ? '✅ Success' : '❌ Failed');
  
  if (method1Success || method2Success || smsTestSuccess) {
    console.log('\n🎉 At least one Twilio connection method works!');
  } else {
    console.log('\n❌ All Twilio connection methods failed. Please check your credentials.');
  }
}

runTests().catch(console.error);