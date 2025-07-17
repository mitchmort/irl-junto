/**
 * Security Logger for Webhook Events
 * Tracks and monitors webhook security events for audit and monitoring
 */

export type SecurityEventType = 
  | 'webhook_signature_invalid'
  | 'webhook_signature_missing'
  | 'webhook_rate_limited'
  | 'webhook_unauthorized_ip'
  | 'webhook_malformed_request'
  | 'webhook_success'
  | 'webhook_error';

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  endpoint: string;
  ip: string;
  userAgent?: string;
  message: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class WebhookSecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Add to in-memory log
    this.events.push(securityEvent);
    
    // Keep only recent events to prevent memory leaks
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console with appropriate level
    this.logToConsole(securityEvent);

    // In production, you would also send to external monitoring
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(securityEvent);
    }
  }

  /**
   * Log to console with appropriate severity level
   */
  private logToConsole(event: SecurityEvent) {
    const logMessage = `[WEBHOOK SECURITY] ${event.type}: ${event.message} | IP: ${event.ip} | Endpoint: ${event.endpoint}`;
    
    switch (event.severity) {
      case 'critical':
        console.error('🚨', logMessage, event.metadata);
        break;
      case 'high':
        console.error('⚠️', logMessage, event.metadata);
        break;
      case 'medium':
        console.warn('⚡', logMessage, event.metadata);
        break;
      case 'low':
        console.info('ℹ️', logMessage, event.metadata);
        break;
    }
  }

  /**
   * Send to external monitoring service (placeholder for production)
   */
  private sendToMonitoring(event: SecurityEvent) {
    // In production, integrate with services like:
    // - Sentry for error tracking
    // - DataDog for metrics
    // - CloudWatch for AWS deployments
    // - Custom webhook for Slack/Teams notifications
    
    console.log('📊 [MONITORING] Would send to external monitoring service:', {
      type: event.type,
      severity: event.severity,
      endpoint: event.endpoint,
      timestamp: event.timestamp
    });
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType, limit = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get security summary for monitoring dashboard
   */
  getSecuritySummary(hoursBack = 24): {
    totalEvents: number;
    criticalEvents: number;
    rateLimitedRequests: number;
    invalidSignatures: number;
    successfulWebhooks: number;
  } {
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const recentEvents = this.events.filter(
      event => new Date(event.timestamp) > cutoff
    );

    return {
      totalEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
      rateLimitedRequests: recentEvents.filter(e => e.type === 'webhook_rate_limited').length,
      invalidSignatures: recentEvents.filter(e => e.type === 'webhook_signature_invalid').length,
      successfulWebhooks: recentEvents.filter(e => e.type === 'webhook_success').length,
    };
  }

  /**
   * Check if there are any critical security issues recently
   */
  hasCriticalIssues(minutesBack = 15): boolean {
    const cutoff = new Date(Date.now() - minutesBack * 60 * 1000);
    return this.events.some(
      event => new Date(event.timestamp) > cutoff && event.severity === 'critical'
    );
  }

  /**
   * Clear old events (cleanup method)
   */
  clearOldEvents(daysBack = 7) {
    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(
      event => new Date(event.timestamp) > cutoff
    );
  }
}

// Singleton instance for the application
export const webhookSecurityLogger = new WebhookSecurityLogger();

// Helper functions for common security events
export const logSecurityEvent = {
  invalidSignature: (endpoint: string, ip: string, userAgent?: string) => {
    webhookSecurityLogger.logEvent({
      type: 'webhook_signature_invalid',
      endpoint,
      ip,
      userAgent,
      message: 'Invalid webhook signature detected',
      severity: 'high',
      metadata: { userAgent }
    });
  },

  missingSignature: (endpoint: string, ip: string) => {
    webhookSecurityLogger.logEvent({
      type: 'webhook_signature_missing',
      endpoint,
      ip,
      message: 'Missing webhook signature in production mode',
      severity: 'high'
    });
  },

  rateLimited: (endpoint: string, ip: string, limit: number) => {
    webhookSecurityLogger.logEvent({
      type: 'webhook_rate_limited',
      endpoint,
      ip,
      message: `Rate limit exceeded (${limit} requests)`,
      severity: 'medium',
      metadata: { limit }
    });
  },

  success: (endpoint: string, ip: string, messageId?: string) => {
    webhookSecurityLogger.logEvent({
      type: 'webhook_success',
      endpoint,
      ip,
      message: 'Webhook processed successfully',
      severity: 'low',
      metadata: { messageId }
    });
  },

  error: (endpoint: string, ip: string, error: string) => {
    webhookSecurityLogger.logEvent({
      type: 'webhook_error',
      endpoint,
      ip,
      message: `Webhook processing error: ${error}`,
      severity: 'medium',
      metadata: { error }
    });
  }
}; 