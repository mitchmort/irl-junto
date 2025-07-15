import { Twilio } from 'twilio';

// Twilio client configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Missing Twilio configuration. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.');
}

// Create Twilio client instance
export const twilioClient = new Twilio(accountSid, authToken);

// Export Twilio phone number for use in services
export const TWILIO_PHONE_NUMBER = twilioPhoneNumber;

// Twilio configuration constants
export const TWILIO_CONFIG = {
  accountSid,
  authToken,
  phoneNumber: twilioPhoneNumber,
  // Rate limiting configuration
  rateLimits: {
    sms: {
      perSecond: 1,
      perMinute: 30,
      perHour: 200,
    },
  },
  // Webhook configuration
  webhooks: {
    statusCallback: '/api/twilio/webhook/status',
    incomingMessage: '/api/twilio/webhook/incoming',
  },
} as const;

// Export types for TypeScript
export type TwilioConfig = typeof TWILIO_CONFIG;