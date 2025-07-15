'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneVerification } from '../auth/phone-verification';
import { usePhoneVerificationRequired } from '../auth/phone-verification-guard';
import { Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface PhoneVerificationReminderProps {
  userId: string;
  onVerified: () => void;
  onContinueWithoutVerification: () => void;
}

export function PhoneVerificationReminder({
  userId,
  onVerified,
  onContinueWithoutVerification,
}: PhoneVerificationReminderProps) {
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { isRequired, phoneVerified } = usePhoneVerificationRequired('create_event');

  const handleVerificationComplete = (phoneNumber: string) => {
    setIsVerified(true);
    setTimeout(() => {
      onVerified();
    }, 1500);
  };

  const handleVerifyNow = () => {
    setShowVerification(true);
  };

  const handleContinueWithout = () => {
    onContinueWithoutVerification();
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Phone Verified!</h3>
            <p className="text-sm text-muted-foreground">
              You can now create events and participants will be able to receive SMS notifications.
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

  // If phone is already verified, don't show this component
  if (phoneVerified) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle>Verify Your Phone for Better Experience</CardTitle>
        <CardDescription>
          Help ensure reliable attendance by verifying your phone number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Why verify your phone?</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Participants get SMS reminders about your events</li>
              <li>• Higher attendance rates (95% vs 70%)</li>
              <li>• You can send updates about time/location changes</li>
              <li>• Build trust with other players</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button onClick={handleVerifyNow} className="w-full">
            Verify Phone Number
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleContinueWithout} 
            className="w-full"
          >
            Continue Without Verification
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can verify your phone number later in your profile settings.
        </p>
      </CardContent>
    </Card>
  );
}