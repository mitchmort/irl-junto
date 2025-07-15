import { z } from 'zod';

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

// Format phone number for display
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Format US numbers as (XXX) XXX-XXXX
  if (normalized.startsWith('+1') && normalized.length === 12) {
    const digits = normalized.substring(2);
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  
  // For international numbers, return as is
  return normalized;
}

// Validate phone number
export function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  normalized?: string;
  error?: string;
} {
  try {
    phoneNumberSchema.parse(phoneNumber);
    const normalized = normalizePhoneNumber(phoneNumber);
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

// Generate verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if verification code is expired
export function isVerificationCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

// Get verification code expiration time (10 minutes from now)
export function getVerificationCodeExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
}

// Mask phone number for display (e.g., (***) ***-1234)
export function maskPhoneNumber(phoneNumber: string): string {
  const formatted = formatPhoneNumberForDisplay(phoneNumber);
  
  if (formatted.startsWith('(') && formatted.length === 14) {
    // US format: (XXX) XXX-XXXX -> (***) ***-XXXX
    return `(***) ***-${formatted.substring(10)}`;
  }
  
  // For international numbers, mask all but last 4 digits
  if (formatted.length > 4) {
    return `${'*'.repeat(formatted.length - 4)}${formatted.substring(formatted.length - 4)}`;
  }
  
  return formatted;
}