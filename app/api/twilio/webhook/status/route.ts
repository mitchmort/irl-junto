import { NextRequest, NextResponse } from 'next/server';
import { deliveryTracker } from '@/lib/notifications';
import { TwilioWebhookStatus } from '@/lib/twilio/types';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData();
    
    const webhookData: TwilioWebhookStatus = {
      MessageSid: formData.get('MessageSid') as string,
      MessageStatus: formData.get('MessageStatus') as TwilioWebhookStatus['MessageStatus'],
      ErrorCode: formData.get('ErrorCode') as string || undefined,
      ErrorMessage: formData.get('ErrorMessage') as string || undefined,
      To: formData.get('To') as string,
      From: formData.get('From') as string,
      Body: formData.get('Body') as string,
    };

    // Validate required fields
    if (!webhookData.MessageSid || !webhookData.MessageStatus) {
      return NextResponse.json(
        { error: 'Missing required webhook data' },
        { status: 400 }
      );
    }

    // Handle the webhook
    await deliveryTracker.handleTwilioWebhook(webhookData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Twilio webhook error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}