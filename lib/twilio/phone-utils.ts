import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber, formatInternational, CountryCode } from 'libphonenumber-js';

// Phone number validation schema
export const phoneNumberSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Phone number contains invalid characters');

// Normalize phone number to E.164 format
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 1 and has 11 digits, it's a US number
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }
  
  // If it has 10 digits, assume it's a US number without country code
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // If it already starts with +, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Otherwise, add + prefix
  return `+${digitsOnly}`;
}

// Format phone number for display using libphonenumber-js
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    // Use national format for better readability
    return parsed.formatNational();
  } catch (error) {
    // Fallback to normalized format
    return normalizePhoneNumber(phoneNumber);
  }
}

// Validate phone number using libphonenumber-js
export function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  normalized?: string;
  error?: string;
} {
  try {
    // First check basic format with zod
    phoneNumberSchema.parse(phoneNumber);
    
    // Then validate with libphonenumber-js
    const isValid = isValidPhoneNumber(phoneNumber);
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid phone number format',
      };
    }
    
    const parsed = parsePhoneNumber(phoneNumber);
    const normalized = parsed.format('E.164');
    
    return {
      isValid: true,
      normalized,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0].message,
      };
    }
    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }
}

// Note: Verification code generation and expiration are now handled by Supabase Auth
// with Twilio Verify integration. These functions are no longer needed.

// Mask phone number for display (e.g., (***) ***-1234)
export function maskPhoneNumber(phoneNumber: string): string {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    const formatted = parsed.formatNational();
    
    // For all numbers, mask all but last 4 digits
    if (formatted.length > 4) {
      const lastFour = formatted.slice(-4);
      const maskedPart = formatted.slice(0, -4).replace(/\d/g, '*');
      return maskedPart + lastFour;
    }
    
    return formatted;
  } catch (error) {
    // Fallback to simple masking
    const formatted = formatPhoneNumberForDisplay(phoneNumber);
    if (formatted.length > 4) {
      return `${'*'.repeat(formatted.length - 4)}${formatted.substring(formatted.length - 4)}`;
    }
    return formatted;
  }
}