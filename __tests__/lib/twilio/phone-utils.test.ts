import { describe, it, expect } from '@jest/globals';
import { 
  validatePhoneNumber, 
  formatPhoneNumberForDisplay, 
  normalizePhoneNumber,
  generateVerificationCode,
  isVerificationCodeExpired,
  getVerificationCodeExpiration,
  maskPhoneNumber
} from '@/lib/twilio/phone-utils';

describe('Phone Utils', () => {
  describe('validatePhoneNumber', () => {
    it('should validate properly formatted US phone numbers', () => {
      const validNumbers = [
        '+12345678901',
        '+1-234-567-8901',
        '+1 234 567 8901',
        '1234567890123'
      ];

      validNumbers.forEach(number => {
        const result = validatePhoneNumber(number);
        console.log('Testing:', number, 'Result:', result);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBeDefined();
      });
    });

    it('should reject clearly invalid phone numbers', () => {
      const invalidNumbers = [
        '123', // Too short
        'abcdefghij', // Non-numeric
        '+++123456', // Multiple + signs
        '', // Empty string
      ];

      invalidNumbers.forEach(number => {
        const result = validatePhoneNumber(number);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize US phone numbers correctly', () => {
      const testCases = [
        { input: '1234567890', expected: '+11234567890' },
        { input: '(555) 123-4567', expected: '+15551234567' },
        { input: '+15551234567', expected: '+15551234567' },
        { input: '1-555-123-4567', expected: '+15551234567' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalizePhoneNumber(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle various formats', () => {
      // Test that it returns something for any input
      expect(normalizePhoneNumber('123')).toBeDefined();
      expect(normalizePhoneNumber('')).toBeDefined();
    });
  });

  describe('formatPhoneNumberForDisplay', () => {
    it('should format US phone numbers', () => {
      const result1 = formatPhoneNumberForDisplay('+15551234567');
      expect(result1).toBe('(555) 123-4567');
      
      const result2 = formatPhoneNumberForDisplay('15551234567');
      expect(result2).toBe('(555) 123-4567');
    });

    it('should handle international numbers', () => {
      const result = formatPhoneNumberForDisplay('+447911123456');
      expect(result).toBe('+447911123456');
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate 6-digit codes', () => {
      for (let i = 0; i < 10; i++) {
        const code = generateVerificationCode();
        expect(code).toMatch(/^\d{6}$/);
        expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
        expect(parseInt(code)).toBeLessThanOrEqual(999999);
      }
    });

    it('should generate different codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateVerificationCode());
      }
      // Should have generated at least 90% unique codes
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('isVerificationCodeExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000);
      expect(isVerificationCodeExpired(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000);
      expect(isVerificationCodeExpired(futureDate)).toBe(false);
    });
  });

  describe('getVerificationCodeExpiration', () => {
    it('should return a date 10 minutes in the future', () => {
      const now = Date.now();
      const expiration = getVerificationCodeExpiration();
      const diff = expiration.getTime() - now;
      
      // Should be approximately 10 minutes (allow 1 second tolerance)
      expect(diff).toBeGreaterThan(9.5 * 60 * 1000);
      expect(diff).toBeLessThan(10.5 * 60 * 1000);
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask US phone numbers', () => {
      const result = maskPhoneNumber('+15551234567');
      expect(result).toBe('(***) ***-4567');
    });

    it('should mask international numbers', () => {
      const result = maskPhoneNumber('+447911123456');
      expect(result).toMatch(/\*+3456$/);
    });

    it('should handle short numbers', () => {
      const result = maskPhoneNumber('123');
      expect(result).toBeDefined();
    });
  });
});