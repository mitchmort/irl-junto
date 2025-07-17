import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { notificationManager } from '@/lib/notifications';

// Request schema
const eventMessageSchema = z.object({
  eventId: z.number().int().positive(),
  senderId: z.string().uuid('Invalid sender ID'),
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
});

const getMessagesSchema = z.object({
  eventId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

// Send organizer message to event participants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, senderId, message } = eventMessageSchema.parse(body);
    
    const supabase = await createClient();

    // Check if sender exists
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, name, phone_verified')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    // Check if sender has verified phone
    if (!sender.phone_verified) {
      return NextResponse.json(
        { error: 'Sender phone number not verified' },
        { status: 400 }
      );
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, organizer')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if sender is the event organizer
    if (event.organizer !== senderId) {
      return NextResponse.json(
        { error: 'Only event organizers can send messages' },
        { status: 403 }
      );
    }

    // Send message to all participants
    const results = await notificationManager.sendOrganizerMessage(
      eventId,
      senderId,
      message
    );

    // Calculate summary
    const summary = {
      total: results.length,
      successful: results.filter((r: any) => r.success).length,
      failed: results.filter((r: any) => !r.success).length,
    };

    return NextResponse.json({
      message: 'Event message sent successfully',
      summary,
      results,
    });

  } catch (error) {
    console.error('Event message error:', error);
    
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

// Get event messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = parseInt(searchParams.get('eventId') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { eventId: validEventId, limit: validLimit, offset: validOffset } = getMessagesSchema.parse({
      eventId,
      limit,
      offset,
    });
    
    const supabase = await createClient();

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', validEventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get event messages with sender info
    const { data: messages, error: messagesError } = await supabase
      .from('event_messages')
      .select(`
        *,
        sender:users!sender_id (
          id,
          name
        )
      `)
      .eq('event_id', validEventId)
      .order('created_at', { ascending: false })
      .range(validOffset, validOffset + validLimit - 1);

    if (messagesError) {
      console.error('Failed to get event messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to get messages' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('event_messages')
      .select('id', { count: 'exact' })
      .eq('event_id', validEventId);

    if (countError) {
      console.error('Failed to get message count:', countError);
      return NextResponse.json(
        { error: 'Failed to get message count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages,
      pagination: {
        total: count || 0,
        limit: validLimit,
        offset: validOffset,
        hasMore: (count || 0) > validOffset + validLimit,
      },
      event: {
        id: event.id,
        title: event.title,
      },
    });

  } catch (error) {
    console.error('Get event messages error:', error);
    
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