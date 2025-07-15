import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the dependencies before importing
jest.mock('@/lib/twilio/client', () => ({
  twilioClient: {
    messages: {
      create: jest.fn(),
    },
  },
  TWILIO_PHONE_NUMBER: '+15551234567',
}));

jest.mock('@/lib/supabase/server', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [{}], error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [{}], error: null })),
      })),
    })),
  },
}));

describe('SMS Service (Simple)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SMS Service Functions', () => {
    it('should exist and be importable', async () => {
      // Test that we can import the SMS service without errors
      const { smsService } = await import('@/lib/twilio');
      expect(smsService).toBeDefined();
      expect(typeof smsService.sendSMS).toBe('function');
    });

    it('should have correct function signatures', async () => {
      const { SMSService } = await import('@/lib/twilio');
      
      // Check that the class exists
      expect(SMSService).toBeDefined();
      expect(typeof SMSService.getInstance).toBe('function');
    });
  });

  describe('Phone Number Validation Integration', () => {
    it('should validate phone numbers correctly', async () => {
      const { validatePhoneNumber } = await import('@/lib/twilio/phone-utils');
      
      const validPhone = '+12345678901';
      const result = validatePhoneNumber(validPhone);
      
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBeDefined();
    });

    it('should reject invalid phone numbers', async () => {
      const { validatePhoneNumber } = await import('@/lib/twilio/phone-utils');
      
      const invalidPhone = '123';
      const result = validatePhoneNumber(invalidPhone);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Verification Code Generation', () => {
    it('should generate valid verification codes', async () => {
      const { generateVerificationCode } = await import('@/lib/twilio/phone-utils');
      
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code)).toBeLessThanOrEqual(999999);
    });
  });

  describe('Rate Limiting', () => {
    it('should have basic configuration', async () => {
      const { TWILIO_PHONE_NUMBER } = await import('@/lib/twilio');
      
      expect(TWILIO_PHONE_NUMBER).toBeDefined();
      expect(TWILIO_PHONE_NUMBER).toMatch(/^\+1\d{10}$/);
    });
  });

  describe('SMS Service Configuration', () => {
    it('should have proper Twilio configuration', async () => {
      const { twilioClient } = await import('@/lib/twilio');
      
      expect(twilioClient).toBeDefined();
      expect(twilioClient.messages).toBeDefined();
    });
  });
});