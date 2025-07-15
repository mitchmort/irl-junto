import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { notificationManager } from '@/lib/notifications';
import { NotificationType } from '@/types/database';

// Request schema
const sendSMSSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  eventId: z.number().int().positive().optional(),
  type: z.enum(['reminder_24h', 'reminder_2h', 'event_update', 'organizer_message']),
  templateData: z.record(z.any()),
  scheduledFor: z.string().datetime().optional(),
});

const batchSMSSchema = z.object({
  notifications: z.array(sendSMSSchema),
});

// Send single SMS notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, type, templateData, scheduledFor } = sendSMSSchema.parse(body);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone_number, phone_verified')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if phone is verified
    if (!user.phone_verified) {
      return NextResponse.json(
        { error: 'User phone number not verified' },
        { status: 400 }
      );
    }

    // If eventId is provided, check if event exists
    if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
    }

    // Send notification
    const result = await notificationManager.notificationService.sendNotification({
      userId,
      eventId,
      type: type as NotificationType,
      channel: 'sms',
      templateData,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'SMS sent successfully',
      notificationId: result.notificationId,
      messageSid: result.messageSid,
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    
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

// Send batch SMS notifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notifications } = batchSMSSchema.parse(body);

    // Validate batch size
    if (notifications.length > 100) {
      return NextResponse.json(
        { error: 'Batch size cannot exceed 100 notifications' },
        { status: 400 }
      );
    }

    // Convert to notification requests
    const notificationRequests = notifications.map(notification => ({
      userId: notification.userId,
      eventId: notification.eventId,
      type: notification.type as NotificationType,
      channel: 'sms' as const,
      templateData: notification.templateData,
      scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor) : undefined,
    }));

    // Send batch
    const results = await notificationManager.notificationService.sendBatchNotifications(notificationRequests);

    // Calculate summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };

    return NextResponse.json({
      message: 'Batch SMS processing completed',
      summary,
      results,
    });

  } catch (error) {
    console.error('Batch SMS error:', error);
    
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