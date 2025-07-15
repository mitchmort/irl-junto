import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { NotificationPreferencesUpdate } from '@/types/database';

// Request schemas
const getPreferencesSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

const updatePreferencesSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  sms_reminders: z.boolean().optional(),
  sms_event_updates: z.boolean().optional(),
  sms_organizer_messages: z.boolean().optional(),
  reminder_24h: z.boolean().optional(),
  reminder_2h: z.boolean().optional(),
  timezone: z.string().optional(),
});

// Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { userId: validUserId } = getPreferencesSchema.parse({ userId });

    // Get user preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', validUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create default ones
        const { data: newPreferences, error: createError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: validUserId,
            sms_reminders: true,
            sms_event_updates: true,
            sms_organizer_messages: true,
            reminder_24h: true,
            reminder_2h: true,
            timezone: 'UTC',
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create default preferences:', createError);
          return NextResponse.json(
            { error: 'Failed to create preferences' },
            { status: 500 }
          );
        }

        return NextResponse.json(newPreferences);
      }

      console.error('Failed to get preferences:', error);
      return NextResponse.json(
        { error: 'Failed to get preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(preferences);

  } catch (error) {
    console.error('Get preferences error:', error);
    
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

// Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = updatePreferencesSchema.parse(body);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update preferences
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('notification_preferences')
      .update(updateData as NotificationPreferencesUpdate)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update preferences:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    
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