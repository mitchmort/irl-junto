'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneVerification } from './phone-verification';
import { Phone, AlertCircle, Check } from 'lucide-react';

interface PhoneVerificationRequiredProps {
  userId: string;
  onVerificationComplete: () => void;
  onSkip?: () => void;
  skipAllowed?: boolean;
  title?: string;
  description?: string;
}

export function PhoneVerificationRequired({
  userId,
  onVerificationComplete,
  onSkip,
  skipAllowed = false,
  title = "Phone Verification Required",
  description = "To receive SMS notifications about your events and ensure account security, please verify your phone number.",
}: PhoneVerificationRequiredProps) {
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationComplete = (phoneNumber: string) => {
    setIsVerified(true);
    setTimeout(() => {
      onVerificationComplete();
    }, 1500);
  };

  const handleGetStarted = () => {
    setShowVerification(true);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Phone Verified!</h3>
            <p className="text-sm text-muted-foreground">
              You can now receive SMS notifications for your events.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showVerification) {
    return (
      <PhoneVerification
        userId={userId}
        onVerificationComplete={handleVerificationComplete}
        onCancel={() => setShowVerification(false)}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Why verify your phone?</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Get SMS reminders 24h and 2h before events</li>
              <li>• Receive notifications about event changes</li>
              <li>• Get messages from event organizers</li>
              <li>• Ensure other participants can rely on your attendance</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button onClick={handleGetStarted} className="w-full">
            Verify Phone Number
          </Button>
          
          {skipAllowed && (
            <Button variant="outline" onClick={handleSkip} className="w-full">
              Skip for Now
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Standard messaging rates may apply. You can change your notification preferences anytime in settings.
        </p>
      </CardContent>
    </Card>
  );
}