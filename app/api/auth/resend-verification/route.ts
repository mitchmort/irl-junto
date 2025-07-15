import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { 
  generateVerificationCode, 
  getVerificationCodeExpiration, 
  validatePhoneNumber 
} from '@/lib/twilio/phone-utils';
import { notificationManager } from '@/lib/notifications';

// Request schema
const resendVerificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = resendVerificationSchema.parse(body);

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a phone number
    if (!user.phone_number) {
      return NextResponse.json(
        { error: 'No phone number associated with this user' },
        { status: 400 }
      );
    }

    // Check if phone is already verified
    if (user.phone_verified) {
      return NextResponse.json(
        { error: 'Phone number already verified' },
        { status: 400 }
      );
    }

    // Check rate limiting - allow resend only after 1 minute
    if (user.phone_verification_expires) {
      const lastSent = new Date(user.phone_verification_expires);
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      
      if (lastSent > oneMinuteAgo) {
        const remainingTime = Math.ceil((lastSent.getTime() - oneMinuteAgo.getTime()) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remainingTime} seconds before requesting another code` },
          { status: 429 }
        );
      }
    }

    // Check hourly rate limiting (max 5 attempts per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempts, error: rateLimitError } = await supabase
      .from('notifications_log')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'phone_verification')
      .gte('created_at', oneHourAgo.toISOString());

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
    } else if (recentAttempts && recentAttempts.length >= 5) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = getVerificationCodeExpiration();

    // Update user with new verification code
    const { error: updateError } = await supabase
      .from('users')
      .update({
        phone_verification_code: verificationCode,
        phone_verification_expires: expiresAt.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update verification code:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate new verification code' },
        { status: 500 }
      );
    }

    // Send SMS verification code
    const smsResult = await notificationManager.sendVerificationCode(
      userId,
      user.phone_number,
      verificationCode
    );

    if (!smsResult.success) {
      console.error('Failed to send verification SMS:', smsResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code resent successfully',
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}