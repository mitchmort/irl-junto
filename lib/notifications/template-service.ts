import { NotificationType } from '@/types/database';
import { SMS_TEMPLATES } from '@/lib/twilio/types';

export interface TemplateData {
  [key: string]: any;
}

export class TemplateService {
  private static instance: TemplateService;

  private constructor() {}

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  // Generate message from template
  async generateMessage(type: NotificationType, data: TemplateData): Promise<string> {
    const template = this.getTemplate(type, data);
    if (!template) {
      throw new Error(`No template found for notification type: ${type}`);
    }

    return this.interpolateTemplate(template, data);
  }

  // Get template for notification type
  private getTemplate(type: NotificationType, data: TemplateData): string | null {
    switch (type) {
      case 'phone_verification':
        return SMS_TEMPLATES.VERIFICATION.template;
      
      case 'reminder_24h':
        return SMS_TEMPLATES.REMINDER_24H.template;
      
      case 'reminder_2h':
        return SMS_TEMPLATES.REMINDER_2H.template;
      
      case 'event_update':
        return this.getEventUpdateTemplate(data);
      
      case 'organizer_message':
        return SMS_TEMPLATES.ORGANIZER_MESSAGE.template;
      
      default:
        return null;
    }
  }

  // Get event update template based on update type
  private getEventUpdateTemplate(data: TemplateData): string {
    const updateType = data.updateType as string;
    
    switch (updateType) {
      case 'location':
        return SMS_TEMPLATES.EVENT_UPDATE_LOCATION.template;
      case 'time':
        return SMS_TEMPLATES.EVENT_UPDATE_TIME.template;
      case 'cancelled':
        return SMS_TEMPLATES.EVENT_CANCELLED.template;
      default:
        return '📢 Update: {eventTitle} has been updated. Check the event page for details.';
    }
  }

  // Interpolate template with data
  private interpolateTemplate(template: string, data: TemplateData): string {
    let result = template;
    
    // Replace placeholders with actual values
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      const value = data[key];
      
      if (value !== undefined && value !== null) {
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });
    
    // Handle special cases
    result = this.handleSpecialCases(result, data);
    
    return result;
  }

  // Handle special template cases
  private handleSpecialCases(message: string, data: TemplateData): string {
    // Handle sport-specific emojis
    if (data.sport) {
      message = this.addSportEmoji(message, data.sport);
    }
    
    // Handle time formatting
    if (data.eventTime) {
      message = message.replace('{eventTime}', this.formatTime(data.eventTime));
    }
    
    // Handle location formatting
    if (data.location) {
      message = message.replace('{location}', this.formatLocation(data.location));
    }
    
    return message;
  }

  // Add sport-specific emoji
  private addSportEmoji(message: string, sport: string): string {
    const sportEmojis: Record<string, string> = {
      basketball: '🏀',
      soccer: '⚽',
      tennis: '🎾',
      volleyball: '🏐',
      football: '🏈',
      baseball: '⚾',
      hockey: '🏒',
      golf: '⛳',
      swimming: '🏊',
      cycling: '🚴',
      running: '🏃',
      climbing: '🧗',
      pickleball: '🏓',
    };
    
    const emoji = sportEmojis[sport.toLowerCase()] || '🏃';
    
    // Add emoji at the beginning if not already present
    if (!message.startsWith(emoji)) {
      return `${emoji} ${message}`;
    }
    
    return message;
  }

  // Format time for display
  private formatTime(time: string): string {
    try {
      // Assume time is in HH:MM format
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${period}`;
    } catch (error) {
      return time; // Return original if formatting fails
    }
  }

  // Format location for display
  private formatLocation(location: string): string {
    // Truncate long locations
    if (location.length > 50) {
      return location.substring(0, 47) + '...';
    }
    
    return location;
  }

  // Validate template data
  validateTemplateData(type: NotificationType, data: TemplateData): {
    isValid: boolean;
    missingFields: string[];
    errors: string[];
  } {
    const requiredFields = this.getRequiredFields(type);
    const missingFields: string[] = [];
    const errors: string[] = [];
    
    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!data[field] || data[field] === '') {
        missingFields.push(field);
      }
    });
    
    // Type-specific validation
    switch (type) {
      case 'phone_verification':
        if (data.code && !/^\d{6}$/.test(data.code)) {
          errors.push('Verification code must be 6 digits');
        }
        break;
      
      case 'reminder_24h':
      case 'reminder_2h':
        if (data.eventTime && !/^\d{1,2}:\d{2}$/.test(data.eventTime)) {
          errors.push('Event time must be in HH:MM format');
        }
        break;
      
      case 'event_update':
        if (!data.updateType || !['location', 'time', 'cancelled'].includes(data.updateType)) {
          errors.push('Update type must be location, time, or cancelled');
        }
        break;
    }
    
    return {
      isValid: missingFields.length === 0 && errors.length === 0,
      missingFields,
      errors,
    };
  }

  // Get required fields for template type
  private getRequiredFields(type: NotificationType): string[] {
    switch (type) {
      case 'phone_verification':
        return ['code'];
      
      case 'reminder_24h':
      case 'reminder_2h':
        return ['eventTitle', 'eventTime', 'location'];
      
      case 'event_update':
        return ['eventTitle', 'updateType'];
      
      case 'organizer_message':
        return ['organizerName', 'eventTitle', 'message'];
      
      default:
        return [];
    }
  }

  // Preview template with sample data
  previewTemplate(type: NotificationType, sampleData?: TemplateData): string {
    const defaultSampleData: Record<NotificationType, TemplateData> = {
      phone_verification: {
        code: '123456',
      },
      reminder_24h: {
        eventTitle: 'Tuesday Evening Basketball',
        eventTime: '19:00',
        location: 'Downtown Sports Center',
        sport: 'basketball',
      },
      reminder_2h: {
        eventTitle: 'Tuesday Evening Basketball',
        location: 'Downtown Sports Center',
        sport: 'basketball',
      },
      event_update: {
        eventTitle: 'Tuesday Evening Basketball',
        updateType: 'location',
        newLocation: 'Westside Community Center',
      },
      organizer_message: {
        organizerName: 'John Doe',
        eventTitle: 'Tuesday Evening Basketball',
        message: 'Please bring your own water bottles tonight!',
      },
    };

    const data = sampleData || defaultSampleData[type];
    
    try {
      return this.generateMessage(type, data);
    } catch (error) {
      return `Error generating preview: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Get all available templates
  getAvailableTemplates(): Array<{
    type: NotificationType;
    template: string;
    variables: string[];
    preview: string;
  }> {
    const types: NotificationType[] = [
      'phone_verification',
      'reminder_24h',
      'reminder_2h',
      'event_update',
      'organizer_message',
    ];

    return types.map(type => ({
      type,
      template: this.getTemplate(type, {}) || '',
      variables: this.getRequiredFields(type),
      preview: this.previewTemplate(type),
    }));
  }
}