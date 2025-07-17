import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TwilioWebhookIncoming } from '@/lib/twilio/types';
import { normalizePhoneNumber } from '@/lib/twilio/phone-utils';
import { validateRequest } from 'twilio';

export async function POST(request: NextRequest) {
  try {
    // Validate Twilio webhook signature for security
    const signature = request.headers.get('x-twilio-signature');
    const url = request.url;
    
    if (process.env.NODE_ENV === 'production' && signature) {
      const formData = await request.formData();
      const params: Record<string, string> = {};
      
      for (const [key, value] of formData.entries()) {
        params[key] = value.toString();
      }
      
      const isValidSignature = validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature,
        url,
        params
      );
      
      if (!isValidSignature) {
        console.error('Invalid Twilio webhook signature for incoming SMS');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      // Production mode requires signature
      console.error('Missing Twilio webhook signature for incoming SMS');
      return NextResponse.json(
        { error: 'Unauthorized - Missing signature' },
        { status: 401 }
      );
    }

    // Parse form data from Twilio webhook
    const formData = await request.formData();
    
    const webhookData: TwilioWebhookIncoming = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string,
      MediaUrl0: formData.get('MediaUrl0') as string || undefined,
      MediaContentType0: formData.get('MediaContentType0') as string || undefined,
    };

    // Validate required fields
    if (!webhookData.MessageSid || !webhookData.From || !webhookData.Body) {
      return NextResponse.json(
        { error: 'Missing required webhook data' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedFrom = normalizePhoneNumber(webhookData.From);

    // Create supabase client
    const supabase = await createClient();

    // Find user by phone number
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('phone_number', normalizedFrom)
      .single();

    if (userError || !user) {
      console.log('User not found for phone number:', normalizedFrom);
      
      // Send auto-response for unknown numbers
      return NextResponse.json(
        { message: 'Thank you for your message. This number is not associated with a Junto account.' },
        { status: 200 }
      );
    }

    // Handle common responses
    const body = webhookData.Body.toLowerCase().trim();
    let response = '';

    if (body === 'stop' || body === 'unsubscribe') {
      // Handle opt-out
      await supabase
        .from('notification_preferences')
        .update({
          sms_reminders: false,
          sms_event_updates: false,
          sms_organizer_messages: false,
        })
        .eq('user_id', user.id);

      response = 'You have been unsubscribed from Junto SMS notifications. Text START to re-enable.';
    } else if (body === 'start' || body === 'subscribe') {
      // Handle opt-in
      await supabase
        .from('notification_preferences')
        .update({
          sms_reminders: true,
          sms_event_updates: true,
          sms_organizer_messages: true,
        })
        .eq('user_id', user.id);

      response = 'You have been re-subscribed to Junto SMS notifications. Text STOP to unsubscribe.';
    } else if (body === 'help') {
      response = 'Junto SMS Commands:\n- STOP: Unsubscribe from notifications\n- START: Re-subscribe to notifications\n- HELP: Show this message\n\nFor support, visit junto.app/help';
    } else {
      // Log the message for potential future processing
      console.log('Incoming SMS from user:', user.id, 'Message:', webhookData.Body);
      
      // For now, send a generic response
      response = 'Thank you for your message. For support, please visit junto.app/help or contact us through the app.';
    }

    // Return TwiML response
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response}</Message>
</Response>`,
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error) {
    console.error('Incoming SMS webhook error:', error);
    
    // Return generic error response
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>We're sorry, but we're unable to process your message right now. Please try again later.</Message>
</Response>`,
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}