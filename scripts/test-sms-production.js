#!/usr/bin/env node

/**
 * Test SMS sending with production Twilio credentials
 * This script will send a real SMS - use carefully!
 */

const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Twilio SMS Production Test\n');
console.log('This script will send a REAL SMS using your production credentials.');
console.log('Current configuration:');
console.log(`  Account SID: ${process.env.TWILIO_ACCOUNT_SID?.substring(0, 10)}...`);
console.log(`  From Number: ${process.env.TWILIO_PHONE_NUMBER}`);
console.log('');

// Validate credentials exist
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error('❌ Missing Twilio credentials. Please check your .env.local file.');
  process.exit(1);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function sendTestSMS(toNumber, message) {
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('\n📤 Sending SMS...');
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
      statusCallback: process.env.NEXT_PUBLIC_APP_URL ? 
        `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status` : 
        undefined
    });
    
    console.log('✅ SMS sent successfully!');
    console.log(`  Message SID: ${result.sid}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  To: ${result.to}`);
    console.log(`  Price: ${result.price || 'Pending'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.message);
    if (error.code) {
      console.error(`  Error Code: ${error.code}`);
    }
    throw error;
  }
}

async function checkAccountBalance() {
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('\n💰 Account Information:');
    console.log(`  Status: ${account.status}`);
    console.log(`  Type: ${account.type}`);
    console.log(`  Friendly Name: ${account.friendlyName}`);
    
    // Get usage records for today
    const today = new Date();
    const usage = await client.usage.records.list({
      category: 'sms',
      startDate: today,
      endDate: today,
      limit: 1
    });
    
    if (usage.length > 0) {
      console.log(`  SMS sent today: ${usage[0].count}`);
      console.log(`  Cost today: $${usage[0].price}`);
    }
  } catch (error) {
    console.error('⚠️  Could not fetch account details:', error.message);
  }
}

async function runTest() {
  try {
    // Check account first
    await checkAccountBalance();
    
    console.log('\n📱 SMS Test Configuration');
    
    // Ask for recipient number
    const toNumber = await askQuestion('Enter recipient phone number (E.164 format, e.g., +1234567890): ');
    
    // Validate phone number format
    if (!toNumber.match(/^\+[1-9]\d{1,14}$/)) {
      console.error('❌ Invalid phone number format. Must be E.164 format (e.g., +1234567890)');
      rl.close();
      return;
    }
    
    // Ask for message
    const defaultMessage = `Test SMS from JUNTO at ${new Date().toLocaleString()}. Your SMS notifications are working correctly!`;
    const customMessage = await askQuestion(`Enter message (or press Enter for default): `);
    const message = customMessage.trim() || defaultMessage;
    
    // Confirm before sending
    console.log('\n📋 Ready to send:');
    console.log(`  To: ${toNumber}`);
    console.log(`  Message: ${message}`);
    console.log(`  From: ${process.env.TWILIO_PHONE_NUMBER}`);
    
    const confirm = await askQuestion('\nSend this SMS? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      await sendTestSMS(toNumber, message);
      
      console.log('\n🎉 Test completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Check that the SMS was received');
      console.log('2. Verify webhook logs if configured');
      console.log('3. Check Twilio console for delivery status');
    } else {
      console.log('\n❌ Test cancelled.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the test
runTest();