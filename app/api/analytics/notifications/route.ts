import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';
import { deliveryTracker } from '@/lib/notifications';

// Request schema
const analyticsQuerySchema = z.object({
  timeframe: z.enum(['day', 'week', 'month']).optional().default('day'),
  type: z.enum(['overview', 'delivery', 'events', 'users']).optional().default('overview'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'day';
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { timeframe: validTimeframe, type: validType } = analyticsQuerySchema.parse({
      timeframe,
      type,
      startDate,
      endDate,
    });

    // Calculate date range
    const now = new Date();
    let fromDate: Date;
    let toDate: Date = now;

    if (startDate && endDate) {
      fromDate = new Date(startDate);
      toDate = new Date(endDate);
    } else {
      switch (validTimeframe) {
        case 'day':
          fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    switch (validType) {
      case 'overview':
        return await getOverviewAnalytics(fromDate, toDate);
      case 'delivery':
        return await getDeliveryAnalytics(fromDate, toDate);
      case 'events':
        return await getEventAnalytics(fromDate, toDate);
      case 'users':
        return await getUserAnalytics(fromDate, toDate);
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getOverviewAnalytics(fromDate: Date, toDate: Date) {
  try {
    // Get basic notification stats
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications_log')
      .select('type, status, created_at')
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString());

    if (notificationsError) {
      throw notificationsError;
    }

    // Get delivery stats from delivery tracker
    const deliveryStats = await deliveryTracker.getDeliveryStats('day');

    // Calculate metrics
    const total = notifications?.length || 0;
    const byType = notifications?.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const byStatus = notifications?.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get user stats
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('phone_verified, created_at')
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString());

    const totalUsers = users?.length || 0;
    const verifiedUsers = users?.filter(u => u.phone_verified).length || 0;

    return NextResponse.json({
      overview: {
        totalNotifications: total,
        deliveryRate: deliveryStats.deliveryRate,
        failureRate: deliveryStats.failureRate,
        totalUsers,
        verifiedUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      },
      notificationsByType: byType,
      notificationsByStatus: byStatus,
      deliveryStats,
      timeframe: { from: fromDate, to: toDate },
    });
  } catch (error) {
    console.error('Overview analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get overview analytics' },
      { status: 500 }
    );
  }
}

async function getDeliveryAnalytics(fromDate: Date, toDate: Date) {
  try {
    // Get detailed delivery metrics
    const { data: notifications, error } = await supabase
      .from('notifications_log')
      .select(`
        type,
        status,
        created_at,
        sent_at,
        delivered_at,
        error_message,
        twilio_sid
      `)
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate delivery metrics
    const total = notifications?.length || 0;
    const delivered = notifications?.filter(n => n.status === 'delivered').length || 0;
    const failed = notifications?.filter(n => ['failed', 'undelivered'].includes(n.status)).length || 0;
    const pending = notifications?.filter(n => n.status === 'pending').length || 0;

    // Calculate average delivery time
    const deliveredNotifications = notifications?.filter(n => n.delivered_at && n.sent_at) || [];
    const averageDeliveryTime = deliveredNotifications.length > 0 
      ? deliveredNotifications.reduce((sum, n) => {
          const sent = new Date(n.sent_at!);
          const delivered = new Date(n.delivered_at!);
          return sum + (delivered.getTime() - sent.getTime());
        }, 0) / deliveredNotifications.length
      : 0;

    // Group by hour for timeline
    const hourlyStats = notifications?.reduce((acc, n) => {
      const hour = new Date(n.created_at!).toISOString().slice(0, 13);
      if (!acc[hour]) {
        acc[hour] = { sent: 0, delivered: 0, failed: 0 };
      }
      if (n.status === 'delivered') acc[hour].delivered++;
      else if (['failed', 'undelivered'].includes(n.status)) acc[hour].failed++;
      acc[hour].sent++;
      return acc;
    }, {} as Record<string, { sent: number; delivered: number; failed: number }>) || {};

    // Get failed notifications details
    const failedNotifications = await deliveryTracker.getFailedDeliveries(50);

    return NextResponse.json({
      summary: {
        total,
        delivered,
        failed,
        pending,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        failureRate: total > 0 ? (failed / total) * 100 : 0,
        averageDeliveryTime: Math.round(averageDeliveryTime / 1000), // in seconds
      },
      hourlyStats,
      failedNotifications,
      timeframe: { from: fromDate, to: toDate },
    });
  } catch (error) {
    console.error('Delivery analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get delivery analytics' },
      { status: 500 }
    );
  }
}

async function getEventAnalytics(fromDate: Date, toDate: Date) {
  try {
    // Get event-related notification stats
    const { data: eventNotifications, error } = await supabase
      .from('notifications_log')
      .select(`
        type,
        status,
        event_id,
        created_at,
        events!inner (
          title,
          sport,
          date,
          organizer
        )
      `)
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString())
      .not('event_id', 'is', null);

    if (error) {
      throw error;
    }

    // Group by event
    const eventStats = eventNotifications?.reduce((acc, n) => {
      const eventId = n.event_id!;
      if (!acc[eventId]) {
        acc[eventId] = {
          eventId,
          title: (n.events as any).title,
          sport: (n.events as any).sport,
          date: (n.events as any).date,
          organizer: (n.events as any).organizer,
          total: 0,
          delivered: 0,
          failed: 0,
        };
      }
      acc[eventId].total++;
      if (n.status === 'delivered') acc[eventId].delivered++;
      if (['failed', 'undelivered'].includes(n.status)) acc[eventId].failed++;
      return acc;
    }, {} as Record<string, any>) || {};

    // Group by sport
    const sportStats = eventNotifications?.reduce((acc, n) => {
      const sport = (n.events as any).sport;
      if (!acc[sport]) {
        acc[sport] = { total: 0, delivered: 0, failed: 0 };
      }
      acc[sport].total++;
      if (n.status === 'delivered') acc[sport].delivered++;
      if (['failed', 'undelivered'].includes(n.status)) acc[sport].failed++;
      return acc;
    }, {} as Record<string, any>) || {};

    // Group by notification type
    const typeStats = eventNotifications?.reduce((acc, n) => {
      const type = n.type;
      if (!acc[type]) {
        acc[type] = { total: 0, delivered: 0, failed: 0 };
      }
      acc[type].total++;
      if (n.status === 'delivered') acc[type].delivered++;
      if (['failed', 'undelivered'].includes(n.status)) acc[type].failed++;
      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json({
      eventStats: Object.values(eventStats),
      sportStats,
      typeStats,
      timeframe: { from: fromDate, to: toDate },
    });
  } catch (error) {
    console.error('Event analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get event analytics' },
      { status: 500 }
    );
  }
}

async function getUserAnalytics(fromDate: Date, toDate: Date) {
  try {
    // Get user notification stats
    const { data: userNotifications, error } = await supabase
      .from('notifications_log')
      .select(`
        user_id,
        type,
        status,
        created_at,
        users!inner (
          name,
          phone_verified,
          created_at
        )
      `)
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString());

    if (error) {
      throw error;
    }

    // Group by user
    const userStats = userNotifications?.reduce((acc, n) => {
      const userId = n.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          name: (n.users as any).name,
          phoneVerified: (n.users as any).phone_verified,
          total: 0,
          delivered: 0,
          failed: 0,
        };
      }
      acc[userId].total++;
      if (n.status === 'delivered') acc[userId].delivered++;
      if (['failed', 'undelivered'].includes(n.status)) acc[userId].failed++;
      return acc;
    }, {} as Record<string, any>) || {};

    // Get verification stats
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('phone_verified, created_at');

    if (usersError) {
      throw usersError;
    }

    const totalUsers = allUsers?.length || 0;
    const verifiedUsers = allUsers?.filter(u => u.phone_verified).length || 0;
    const newUsers = allUsers?.filter(u => 
      new Date(u.created_at!) >= fromDate && new Date(u.created_at!) <= toDate
    ).length || 0;

    return NextResponse.json({
      userStats: Object.values(userStats),
      verificationStats: {
        totalUsers,
        verifiedUsers,
        newUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      },
      timeframe: { from: fromDate, to: toDate },
    });
  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get user analytics' },
      { status: 500 }
    );
  }
}