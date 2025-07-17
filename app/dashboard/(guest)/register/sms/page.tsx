'use client'

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { handleError, handleSuccess } from "@/lib/error-handler";
import { formatPhoneNumberForDisplay, maskPhoneNumber } from "@/lib/twilio/phone-utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function SmsRegisterPage() {
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const router = useRouter();
  const { verifyOtp, registerWithPhone } = useAuth();

  const handlePhoneChange = (value: string, countryData: any) => {
    setPhoneNumber(value);
    // Validate phone number length based on country
    const minLength = countryData.format.replace(/[^#]/g, '').length;
    setIsValidPhone(value.length >= minLength + countryData.dialCode.length);
  };

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format phone number with + prefix for international
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await registerWithPhone(formattedPhone, name);
      
      if (result) {
        setSuccess(`Verification code sent to ${formatPhoneNumberForDisplay(formattedPhone)}`);
        setStep('verification');
        setResendCooldown(60);
      }
    } catch (err) {
      handleError(err);
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const authResult = await verifyOtp(formattedPhone, verificationCode);
      
      if (authResult?.user) {
        handleSuccess("Account created successfully! Welcome to Junto! Redirecting to complete your profile...");
        
        // Small delay to ensure auth state is updated, then redirect to profile page
        setTimeout(() => {
          router.push("/dashboard/pages/profile");
        }, 1500);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      handleError(err);
      setError(err instanceof Error ? err.message : 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await registerWithPhone(formattedPhone, name);
      
      if (result) {
        setSuccess('Verification code resent successfully');
        setResendCooldown(60);
      }
    } catch (err) {
      handleError(err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('details');
    setVerificationCode('');
    setError('');
    setSuccess('');
  };

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 'details' ? 'Create your account' : 'Verify your phone'}
          </CardTitle>
          <CardDescription>
            {step === 'details' ? (
              'Enter your information to create your account'
            ) : (
              `We sent a 6-digit code to ${maskPhoneNumber(phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`)}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form onSubmit={handleStartRegistration}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    country={'us'}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    inputProps={{
                      name: 'phone',
                      required: true,
                      autoComplete: 'tel',
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      padding: '0 12px 0 58px',
                    }}
                    buttonStyle={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px 0 0 6px',
                      backgroundColor: '#f8fafc',
                    }}
                    dropdownStyle={{
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  {phoneNumber && !isValidPhone && (
                    <p className="text-sm text-red-600">Please enter a valid phone number</p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !name.trim() || !isValidPhone}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>

              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={verificationCode}
                      onChange={setVerificationCode}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn&apos;t receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={loading || resendCooldown > 0}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {loading ? 'Resending...' : 
                     resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || verificationCode.length !== 6} 
                    className="flex-1"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/dashboard/login/sms" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}