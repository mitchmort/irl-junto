import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateICalendar } from '@/lib/calendar-export';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', parseInt(id))
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .maybeSingle();
    
    // Only allow participants and organizers to download calendar
    if (!participant && event.organizer !== user.id) {
      return NextResponse.json(
        { error: 'You must be a participant to add this event to your calendar' },
        { status: 403 }
      );
    }
    
    // Get organizer info if available
    let organizerName = 'Event Organizer';
    let organizerEmail = undefined;
    
    if (event.organizer) {
      const { data: organizer } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', event.organizer)
        .single();
      
      if (organizer) {
        organizerName = organizer.full_name || organizer.username || 'Event Organizer';
      }
    }
    
    // Generate the iCalendar content
    const icsContent = generateICalendar({
      event,
      organizerName,
      participantCount: event.participant_count
    });
    
    // Return the .ics file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${event.url_slug || event.id}-event.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error generating calendar file:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    );
  }
}