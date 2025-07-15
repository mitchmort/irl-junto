import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { 
  generateVerificationCode, 
  getVerificationCodeExpiration, 
  validatePhoneNumber,
  normalizePhoneNumber 
} from '@/lib/twilio/phone-utils';
import { smsService } from '@/lib/twilio';
import { notificationManager } from '@/lib/notifications';

// Request schema
const verifyPhoneRequestSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  userId: z.string().uuid('Invalid user ID'),
});

const confirmVerificationSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  userId: z.string().uuid('Invalid user ID'),
});

// Send verification code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, userId } = verifyPhoneRequestSchema.parse(body);

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneValidation.normalized!;

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, phone_number, phone_verified')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if phone number is already verified for this user
    if (existingUser.phone_verified && existingUser.phone_number === normalizedPhone) {
      return NextResponse.json(
        { error: 'Phone number already verified' },
        { status: 400 }
      );
    }

    // Check if phone number is already used by another user
    const { data: phoneInUse, error: phoneCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', normalizedPhone)
      .neq('id', userId)
      .single();

    if (phoneCheckError?.code !== 'PGRST116' && phoneInUse) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 400 }
      );
    }

    // Check rate limiting (max 5 attempts per hour)
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

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = getVerificationCodeExpiration();

    // Update user with verification code
    const { error: updateError } = await supabase
      .from('users')
      .update({
        phone_number: normalizedPhone,
        phone_verification_code: verificationCode,
        phone_verification_expires: expiresAt.toISOString(),
        phone_verified: false,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user verification code:', updateError);
      return NextResponse.json(
        { error: 'Failed to update verification code' },
        { status: 500 }
      );
    }

    // Send SMS verification code
    const smsResult = await notificationManager.sendVerificationCode(
      userId,
      normalizedPhone,
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
      message: 'Verification code sent successfully',
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    
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

// Verify confirmation code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code, userId } = confirmVerificationSchema.parse(body);

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneValidation.normalized!;

    // Get user with verification code
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

    // Check if phone number matches
    if (user.phone_number !== normalizedPhone) {
      return NextResponse.json(
        { error: 'Phone number mismatch' },
        { status: 400 }
      );
    }

    // Check if verification code matches
    if (user.phone_verification_code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (!user.phone_verification_expires || new Date() > new Date(user.phone_verification_expires)) {
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }

    // Mark phone as verified
    const { error: verifyError } = await supabase
      .from('users')
      .update({
        phone_verified: true,
        phone_verification_code: null,
        phone_verification_expires: null,
      })
      .eq('id', userId);

    if (verifyError) {
      console.error('Failed to verify phone:', verifyError);
      return NextResponse.json(
        { error: 'Failed to verify phone' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Phone verified successfully',
      phoneNumber: normalizedPhone,
    });

  } catch (error) {
    console.error('Phone verification confirmation error:', error);
    
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