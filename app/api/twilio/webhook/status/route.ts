import { NextRequest, NextResponse } from 'next/server';
import { deliveryTracker } from '@/lib/notifications';
import { TwilioWebhookStatus } from '@/lib/twilio/types';
import { validateRequest } from 'twilio';
import { statusWebhookRateLimiter, getClientIP, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { logSecurityEvent } from '@/lib/security/webhook-logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimitResult = statusWebhookRateLimiter.checkLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent.rateLimited('/api/twilio/webhook/status', clientIP, 50);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Too many requests.' },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult)
        }
      );
    }

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
        logSecurityEvent.invalidSignature('/api/twilio/webhook/status', clientIP, request.headers.get('user-agent') || undefined);
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
    } else if (process.env.NODE_ENV === 'production') {
      // Production mode requires signature
      logSecurityEvent.missingSignature('/api/twilio/webhook/status', clientIP);
      return NextResponse.json(
        { error: 'Unauthorized - Missing signature' },
        { status: 401 }
      );
    } else {
      // Development mode - parse normally but log for security awareness
      console.log('⚠️  Development mode: Twilio webhook signature validation skipped');
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

    // Log successful processing
    logSecurityEvent.success('/api/twilio/webhook/status', clientIP, webhookData.MessageSid);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    const clientIP = getClientIP(request);
    logSecurityEvent.error('/api/twilio/webhook/status', clientIP, error.message || 'Unknown error');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}