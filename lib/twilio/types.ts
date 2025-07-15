// Twilio-specific types and interfaces

export interface TwilioWebhookStatus {
  MessageSid: string;
  MessageStatus: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  ErrorCode?: string;
  ErrorMessage?: string;
  To: string;
  From: string;
  Body: string;
}

export interface TwilioWebhookIncoming {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

export interface RateLimitInfo {
  phoneNumber: string;
  timestamps: number[];
  limit: number;
  window: number; // in milliseconds
}

export interface SMSTemplate {
  type: 'verification' | 'reminder_24h' | 'reminder_2h' | 'event_update' | 'organizer_message';
  template: string;
  variables: string[];
}

export interface SMSDeliveryReport {
  messageSid: string;
  to: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  dateCreated: string;
  dateUpdated: string;
  dateSent?: string;
}

export interface BatchSMSRequest {
  messages: Array<{
    to: string;
    body: string;
    eventId?: number;
    userId: string;
    type: string;
  }>;
}

export interface BatchSMSResponse {
  results: Array<{
    success: boolean;
    messageSid?: string;
    error?: string;
    to: string;
  }>;
  totalSent: number;
  totalFailed: number;
}

// Twilio error codes and their meanings
export const TWILIO_ERROR_CODES = {
  21211: 'Invalid phone number format',
  21408: 'Permission denied for this phone number',
  21612: 'The phone number cannot receive SMS messages',
  21614: 'Phone number is not a valid mobile number',
  21617: 'Phone number is not currently reachable',
  30001: 'Queue overflow',
  30002: 'Account suspended',
  30003: 'Unreachable destination handset',
  30004: 'Message blocked',
  30005: 'Unknown destination handset',
  30006: 'Landline or unreachable carrier',
  30007: 'Carrier violation',
  30008: 'Unknown error',
} as const;

export type TwilioErrorCode = keyof typeof TWILIO_ERROR_CODES;

// SMS Templates
export const SMS_TEMPLATES = {
  VERIFICATION: {
    type: 'verification' as const,
    template: 'Your Junto verification code is: {code}. This code expires in 10 minutes.',
    variables: ['code'],
  },
  REMINDER_24H: {
    type: 'reminder_24h' as const,
    template: '📅 Game reminder: {eventTitle} tomorrow at {eventTime} at {location}. See you there!',
    variables: ['eventTitle', 'eventTime', 'location'],
  },
  REMINDER_2H: {
    type: 'reminder_2h' as const,
    template: '⏰ {eventTitle} starts in 2 hours at {location}. Don\'t be late!',
    variables: ['eventTitle', 'location'],
  },
  EVENT_UPDATE_LOCATION: {
    type: 'event_update' as const,
    template: '📍 Location changed: {eventTitle} moved to {newLocation}',
    variables: ['eventTitle', 'newLocation'],
  },
  EVENT_UPDATE_TIME: {
    type: 'event_update' as const,
    template: '⏰ Time update: {eventTitle} now starts at {newTime}',
    variables: ['eventTitle', 'newTime'],
  },
  EVENT_CANCELLED: {
    type: 'event_update' as const,
    template: '❌ Cancelled: {eventTitle} has been cancelled. Sorry for the inconvenience.',
    variables: ['eventTitle'],
  },
  ORGANIZER_MESSAGE: {
    type: 'organizer_message' as const,
    template: '📧 Message from {organizerName} about {eventTitle}: {message}',
    variables: ['organizerName', 'eventTitle', 'message'],
  },
} as const;

export type SMSTemplateType = keyof typeof SMS_TEMPLATES;