// Notification service exports
export { NotificationService, notificationService } from './notification-service';
export type { NotificationRequest, NotificationResult } from './notification-service';
import { NotificationType } from '@/types/database';

export { TemplateService } from './template-service';
export type { TemplateData } from './template-service';

export { NotificationScheduler, notificationScheduler } from './scheduler';
export type { ScheduledNotification } from './scheduler';

export { DeliveryTracker, deliveryTracker } from './delivery-tracker';
export type { DeliveryStatus } from './delivery-tracker';

// Combined service for easy access
export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Lazy getters to avoid circular dependencies
  private get notificationService() {
    const { notificationService } = require('./notification-service');
    return notificationService;
  }

  private get scheduler() {
    const { notificationScheduler } = require('./scheduler');
    return notificationScheduler;
  }

  private get deliveryTracker() {
    const { deliveryTracker } = require('./delivery-tracker');
    return deliveryTracker;
  }

  // Convenience methods
  async sendVerificationCode(userId: string, phoneNumber: string, code: string) {
    return this.notificationService.sendPhoneVerification(userId, phoneNumber, code);
  }

  async sendEventReminder(userId: string, eventId: number, reminderType: 'reminder_24h' | 'reminder_2h') {
    return this.notificationService.sendEventReminder(userId, eventId, reminderType);
  }

  async sendEventUpdate(eventId: number, updateType: 'location' | 'time' | 'cancelled', newValue?: string) {
    return this.notificationService.sendEventUpdate(eventId, updateType, newValue);
  }

  async sendOrganizerMessage(eventId: number, senderId: string, message: string) {
    return this.notificationService.sendOrganizerMessage(eventId, senderId, message);
  }

  async sendNotification(request: NotificationRequest) {
    return this.notificationService.sendNotification(request);
  }

  async sendBatchNotifications(requests: NotificationRequest[]) {
    return this.notificationService.sendBatchNotifications(requests);
  }

  async scheduleEventReminders(eventId: number) {
    return this.scheduler.scheduleEventReminders(eventId);
  }

  async rescheduleEventNotifications(eventId: number, newDateTime: Date) {
    return this.scheduler.rescheduleEventNotifications(eventId, newDateTime);
  }

  async cancelEventNotifications(eventId: number, type?: NotificationType) {
    return this.scheduler.cancelEventNotifications(eventId, type);
  }

  async processScheduledNotifications() {
    return this.notificationService.processScheduledNotifications();
  }

  async syncDeliveryStatus() {
    return this.deliveryTracker.syncDeliveryStatus();
  }

  async getDeliveryStats(timeframe: 'day' | 'week' | 'month' = 'day') {
    return this.deliveryTracker.getDeliveryStats(timeframe);
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();