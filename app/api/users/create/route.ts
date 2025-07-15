import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { validatePhoneNumber } from '@/lib/twilio/phone-utils';

// Request schema
const createUserSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, phone_number } = createUserSchema.parse(body);

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone_number);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneValidation.normalized!;

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if phone number is already in use
    const { data: phoneInUse, error: phoneCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', normalizedPhone)
      .single();

    if (phoneInUse) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 400 }
      );
    }

    // Create user in users table
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id,
        email,
        name,
        phone_number: normalizedPhone,
        phone_verified: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create user:', createError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser,
    });

  } catch (error) {
    console.error('Create user error:', error);
    
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