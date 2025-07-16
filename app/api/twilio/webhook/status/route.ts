import { NextRequest, NextResponse } from 'next/server';
import { deliveryTracker } from '@/lib/notifications';
import { TwilioWebhookStatus } from '@/lib/twilio/types';
import { validateRequest } from 'twilio';

export async function POST(request: NextRequest) {
  try {
    // Validate Twilio webhook signature for security
    const signature = request.headers.get('x-twilio-signature');
    const url = request.url;
    let webhookData: TwilioWebhookStatus;
    
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
        console.error('Invalid Twilio webhook signature');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      webhookData = {
        MessageSid: params.MessageSid,
        MessageStatus: params.MessageStatus as TwilioWebhookStatus['MessageStatus'],
        ErrorCode: params.ErrorCode || undefined,
        ErrorMessage: params.ErrorMessage || undefined,
        To: params.To,
        From: params.From,
        Body: params.Body,
      };
    } else {
      // Development mode or missing signature - parse normally
      const formData = await request.formData();
      
      webhookData = {
        MessageSid: formData.get('MessageSid') as string,
        MessageStatus: formData.get('MessageStatus') as TwilioWebhookStatus['MessageStatus'],
        ErrorCode: formData.get('ErrorCode') as string || undefined,
        ErrorMessage: formData.get('ErrorMessage') as string || undefined,
        To: formData.get('To') as string,
        From: formData.get('From') as string,
        Body: formData.get('Body') as string,
      };
    }

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