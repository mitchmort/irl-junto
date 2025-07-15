import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { notificationManager } from '@/lib/notifications';

// Request schema
const scheduleRemindersSchema = z.object({
  eventId: z.number().int().positive(),
  organizerId: z.string().uuid('Invalid organizer ID'),
});

const rescheduleRemindersSchema = z.object({
  eventId: z.number().int().positive(),
  newDateTime: z.string().datetime(),
  organizerId: z.string().uuid('Invalid organizer ID'),
});

// Schedule reminders for an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, organizerId } = scheduleRemindersSchema.parse(body);

    // Check if organizer exists
    const { data: organizer, error: organizerError } = await supabase
      .from('users')
      .select('id, phone_verified')
      .eq('id', organizerId)
      .single();

    if (organizerError || !organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Check if event exists and organizer owns it
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if organizer owns the event
    if (event.organizer !== organizerId) {
      return NextResponse.json(
        { error: 'Only event organizers can schedule reminders' },
        { status: 403 }
      );
    }

    // Check if event is in the future
    const eventDateTime = new Date(`${event.date} ${event.time}`);
    const now = new Date();
    
    if (eventDateTime <= now) {
      return NextResponse.json(
        { error: 'Cannot schedule reminders for past events' },
        { status: 400 }
      );
    }

    // Schedule reminders
    await notificationManager.scheduleEventReminders(eventId);

    return NextResponse.json({
      message: 'Reminders scheduled successfully',
      eventId,
      eventDateTime: eventDateTime.toISOString(),
    });

  } catch (error) {
    console.error('Schedule reminders error:', error);
    
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

// Reschedule reminders for an event (when event time changes)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, newDateTime, organizerId } = rescheduleRemindersSchema.parse(body);

    // Check if organizer exists
    const { data: organizer, error: organizerError } = await supabase
      .from('users')
      .select('id, phone_verified')
      .eq('id', organizerId)
      .single();

    if (organizerError || !organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Check if event exists and organizer owns it
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if organizer owns the event
    if (event.organizer !== organizerId) {
      return NextResponse.json(
        { error: 'Only event organizers can reschedule reminders' },
        { status: 403 }
      );
    }

    // Check if new date/time is in the future
    const newEventDateTime = new Date(newDateTime);
    const now = new Date();
    
    if (newEventDateTime <= now) {
      return NextResponse.json(
        { error: 'Cannot schedule reminders for past events' },
        { status: 400 }
      );
    }

    // Reschedule reminders
    await notificationManager.scheduler.rescheduleEventNotifications(eventId, newEventDateTime);

    return NextResponse.json({
      message: 'Reminders rescheduled successfully',
      eventId,
      newDateTime: newEventDateTime.toISOString(),
    });

  } catch (error) {
    console.error('Reschedule reminders error:', error);
    
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

// Cancel reminders for an event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = parseInt(searchParams.get('eventId') || '0');
    const organizerId = searchParams.get('organizerId') || '';

    if (!eventId || !organizerId) {
      return NextResponse.json(
        { error: 'Event ID and organizer ID are required' },
        { status: 400 }
      );
    }

    // Check if organizer exists
    const { data: organizer, error: organizerError } = await supabase
      .from('users')
      .select('id')
      .eq('id', organizerId)
      .single();

    if (organizerError || !organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Check if event exists and organizer owns it
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if organizer owns the event
    if (event.organizer !== organizerId) {
      return NextResponse.json(
        { error: 'Only event organizers can cancel reminders' },
        { status: 403 }
      );
    }

    // Cancel reminders
    await notificationManager.scheduler.cancelEventNotifications(eventId);

    return NextResponse.json({
      message: 'Reminders cancelled successfully',
      eventId,
    });

  } catch (error) {
    console.error('Cancel reminders error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}