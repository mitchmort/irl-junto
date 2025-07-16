#!/usr/bin/env node

/**
 * Simple test to verify Twilio authentication
 */

require('dotenv').config({ path: '.env.local' });

console.log('Testing Twilio Authentication...\n');

console.log('Environment Check:');
console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ Set (hidden)' : '❌ Missing'}`);
console.log(`TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || '❌ Missing'}`);

async function testAuth() {
  try {
    const twilio = require('twilio');
    
    console.log('\nAttempting to connect to Twilio...');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('Fetching account details...');
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    console.log('\n✅ Authentication successful!');
    console.log('Account Details:');
    console.log(`  SID: ${account.sid}`);
    console.log(`  Friendly Name: ${account.friendlyName}`);
    console.log(`  Status: ${account.status}`);
    console.log(`  Type: ${account.type}`);
    console.log(`  Date Created: ${account.dateCreated}`);
    
    // Test phone number
    console.log('\nVerifying phone number...');
    try {
      const phoneNumbers = await client.incomingPhoneNumbers.list({limit: 20});
      const ourNumber = phoneNumbers.find(p => p.phoneNumber === process.env.TWILIO_PHONE_NUMBER);
      
      if (ourNumber) {
        console.log('✅ Phone number verified:');
        console.log(`  Number: ${ourNumber.phoneNumber}`);
        console.log(`  Friendly Name: ${ourNumber.friendlyName}`);
        console.log(`  Capabilities: SMS=${ourNumber.capabilities.sms}, Voice=${ourNumber.capabilities.voice}`);
      } else {
        console.log(`⚠️  Phone number ${process.env.TWILIO_PHONE_NUMBER} not found in account`);
        console.log('Available numbers:');
        phoneNumbers.forEach(p => console.log(`  - ${p.phoneNumber}`));
      }
    } catch (err) {
      console.log('⚠️  Could not verify phone number:', err.message);
    }
    
  } catch (error) {
    console.error('\n❌ Authentication failed!');
    console.error('Error:', error.message);
    
    if (error.status === 401) {
      console.error('\nPossible causes:');
      console.error('1. Invalid Account SID or Auth Token');
      console.error('2. Auth Token may have been regenerated');
      console.error('3. Account may be suspended');
    }
  }
}

testAuth();