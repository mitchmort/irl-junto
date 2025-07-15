// Twilio service exports
export { twilioClient, TWILIO_PHONE_NUMBER, TWILIO_CONFIG } from './client';
export { SMSService } from './sms-service';
export type { SMSMessage, SMSResult } from './sms-service';
export {
  normalizePhoneNumber,
  formatPhoneNumberForDisplay,
  validatePhoneNumber,
  generateVerificationCode,
  isVerificationCodeExpired,
  getVerificationCodeExpiration,
  maskPhoneNumber,
  phoneNumberSchema,
} from './phone-utils';
export * from './types';

// Import and create singleton instance
import { SMSService } from './sms-service';
export const smsService = SMSService.getInstance();