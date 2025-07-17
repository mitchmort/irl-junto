'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneInput } from './phone-input';
import { PhoneVerification } from './phone-verification';
import { useAuth } from '@/hooks/use-auth';
import { handleError, handleSuccess } from '@/lib/error-handler';
import { CheckCircle, AlertCircle, User, Mail, Lock } from 'lucide-react';

interface RegistrationStep {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
}

export function RegistrationWithPhone() {
  const [step, setStep] = useState<'account' | 'phone' | 'complete'>('account');
  const [formData, setFormData] = useState<RegistrationStep>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Create Supabase account
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
      });

      if (result?.user) {
        setUserId(result.user.id);
        
        // Create user in our users table
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: result.user.id,
            email: formData.email,
            name: formData.fullName,
            phone_number: formData.phoneNumber,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create user profile');
        }

        setStep('phone');
      }
    } catch (err) {
      handleError(err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerificationComplete = (phoneNumber: string) => {
    setStep('complete');
    setTimeout(() => {
      handleSuccess('Account created successfully! Welcome to Junto!');
      router.push('/dashboard/default');
    }, 2000);
  };

  const handleInputChange = (field: keyof RegistrationStep, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (step === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Welcome to Junto!</h3>
            <p className="text-sm text-muted-foreground">
              Your account has been created and your phone number is verified. 
              You&apos;re all set to start organizing and joining events!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'phone') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Almost Done!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Let&apos;s verify your phone number to enable SMS notifications
          </p>
        </div>
        <PhoneVerification
          userId={userId}
          onVerificationComplete={handlePhoneVerificationComplete}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          Join Junto to organize and participate in sports events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <PhoneInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(value) => handleInputChange('phoneNumber', value)}
            onValidationChange={setPhoneValid}
            required
            disabled={loading}
          />

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !phoneValid || !formData.email || !formData.password || !formData.fullName}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/dashboard/login/v1" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}