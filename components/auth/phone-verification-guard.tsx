'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PhoneVerificationRequired } from './phone-verification-required';
import { LoadingSpinner } from '@/components/loading/loading-spinner';
import { supabase } from '@/lib/supabase/client';

interface PhoneVerificationGuardProps {
  children: React.ReactNode;
  skipAllowed?: boolean;
  requiredForActions?: string[];
}

export function PhoneVerificationGuard({ 
  children, 
  skipAllowed = false,
  requiredForActions = []
}: PhoneVerificationGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  useEffect(() => {
    const checkPhoneVerification = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has verified phone number
        const { data: userData, error } = await supabase
          .from('users')
          .select('phone_verified, phone_number')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking phone verification:', error);
          setPhoneVerified(false);
        } else {
          setPhoneVerified(userData?.phone_verified || false);
        }
      } catch (error) {
        console.error('Error checking phone verification:', error);
        setPhoneVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkPhoneVerification();
  }, [user]);

  const handleVerificationComplete = () => {
    setPhoneVerified(true);
    setShowPhoneVerification(false);
  };

  const handleSkip = () => {
    setShowPhoneVerification(false);
  };

  const handleVerificationRequired = () => {
    setShowPhoneVerification(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  if (showPhoneVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <PhoneVerificationRequired
          userId={user.id}
          onVerificationComplete={handleVerificationComplete}
          onSkip={skipAllowed ? handleSkip : undefined}
          skipAllowed={skipAllowed}
        />
      </div>
    );
  }

  // If phone is not verified but verification is required for specific actions
  if (phoneVerified === false && requiredForActions.length > 0) {
    return (
      <PhoneVerificationContext.Provider value={{
        phoneVerified,
        requireVerification: handleVerificationRequired,
        requiredForActions,
      }}>
        {children}
      </PhoneVerificationContext.Provider>
    );
  }

  // If phone is not verified and skipAllowed is false, show verification requirement
  if (phoneVerified === false && !skipAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <PhoneVerificationRequired
          userId={user.id}
          onVerificationComplete={handleVerificationComplete}
          skipAllowed={skipAllowed}
        />
      </div>
    );
  }

  return <>{children}</>;
}

// Context for components that need to check phone verification status
import { createContext, useContext } from 'react';

interface PhoneVerificationContextType {
  phoneVerified: boolean;
  requireVerification: () => void;
  requiredForActions: string[];
}

const PhoneVerificationContext = createContext<PhoneVerificationContextType | null>(null);

export function usePhoneVerificationContext() {
  const context = useContext(PhoneVerificationContext);
  return context;
}

// Hook to check if phone verification is required for a specific action
export function usePhoneVerificationRequired(action: string) {
  const context = usePhoneVerificationContext();
  
  if (!context) {
    return { isRequired: false, requireVerification: () => {} };
  }

  const isRequired = !context.phoneVerified && context.requiredForActions.includes(action);
  
  return {
    isRequired,
    requireVerification: context.requireVerification,
    phoneVerified: context.phoneVerified,
  };
}