import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/lib/notifications';

// This endpoint will be called by a cron job service (like Vercel Cron or external service)
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    
    // Process scheduled notifications
    await notificationManager.processScheduledNotifications();
    
    // Sync delivery status with Twilio
    await notificationManager.syncDeliveryStatus();
    
    // Get statistics
    const stats = await notificationManager.getDeliveryStats('day');
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    return NextResponse.json({
      message: 'Notifications processed successfully',
      processingTime,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cron job error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const stats = await notificationManager.getDeliveryStats('day');
    
    return NextResponse.json({
      status: 'healthy',
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}