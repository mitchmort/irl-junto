import { useState, useCallback } from 'react';

export interface PhoneVerificationResult {
  success: boolean;
  error?: string;
  expiresAt?: string;
}

export function usePhoneVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Send verification code
  const sendVerificationCode = useCallback(async (
    userId: string,
    phoneNumber: string
  ): Promise<PhoneVerificationResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setSuccess(data.message);
      return {
        success: true,
        expiresAt: data.expiresAt,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify code
  const verifyCode = useCallback(async (
    userId: string,
    phoneNumber: string,
    code: string
  ): Promise<PhoneVerificationResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          phoneNumber,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      setSuccess(data.message);
      return {
        success: true,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend verification code
  const resendVerificationCode = useCallback(async (
    userId: string
  ): Promise<PhoneVerificationResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code');
      }

      setSuccess(data.message);
      return {
        success: true,
        expiresAt: data.expiresAt,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification code';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error and success states
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    sendVerificationCode,
    verifyCode,
    resendVerificationCode,
    clearMessages,
  };
}