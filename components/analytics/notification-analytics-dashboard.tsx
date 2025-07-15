'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface NotificationAnalytics {
  overview: {
    totalNotifications: number;
    deliveryRate: number;
    failureRate: number;
    totalUsers: number;
    verifiedUsers: number;
    verificationRate: number;
  };
  notificationsByType: Record<string, number>;
  notificationsByStatus: Record<string, number>;
  deliveryStats: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    deliveryRate: number;
    failureRate: number;
  };
  timeframe: {
    from: string;
    to: string;
  };
}

const NOTIFICATION_TYPE_LABELS = {
  'phone_verification': 'Phone Verification',
  'reminder_24h': '24h Reminders',
  'reminder_2h': '2h Reminders',
  'event_update': 'Event Updates',
  'organizer_message': 'Organizer Messages',
};

const STATUS_LABELS = {
  'pending': 'Pending',
  'sending': 'Sending',
  'sent': 'Sent',
  'delivered': 'Delivered',
  'failed': 'Failed',
  'undelivered': 'Undelivered',
};

export function NotificationAnalyticsDashboard() {
  const [data, setData] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (selectedTimeframe: string = timeframe) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/notifications?timeframe=${selectedTimeframe}&type=overview`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notification Analytics</h2>
          <div className="flex items-center gap-2">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'failed': 
      case 'undelivered': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': 
      case 'undelivered': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notification Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalNotifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              SMS notifications sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            {data.overview.deliveryRate >= 95 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.deliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.verificationRate.toFixed(1)}% of {data.overview.totalUsers} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.failureRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Failed deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types">By Type</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications by Type</CardTitle>
              <CardDescription>
                Breakdown of notification types sent in the selected timeframe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.notificationsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {NOTIFICATION_TYPE_LABELS[type as keyof typeof NOTIFICATION_TYPE_LABELS] || type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{count.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        ({((count / data.overview.totalNotifications) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications by Status</CardTitle>
              <CardDescription>
                Current status of all notifications in the selected timeframe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.notificationsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1">
                          {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{count.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        ({((count / data.overview.totalNotifications) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Statistics</CardTitle>
              <CardDescription>
                Detailed delivery performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">{data.deliveryStats.total}</div>
                  <div className="text-sm text-blue-600">Total Sent</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">{data.deliveryStats.delivered}</div>
                  <div className="text-sm text-green-600">Delivered</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50">
                  <div className="text-2xl font-bold text-red-600">{data.deliveryStats.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50">
                  <div className="text-2xl font-bold text-yellow-600">{data.deliveryStats.pending}</div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Alert */}
      {data.overview.deliveryRate < 95 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Delivery Rate Below Target:</strong> Current delivery rate is {data.overview.deliveryRate.toFixed(1)}%, 
            below the 95% target. Consider reviewing failed notifications and optimizing message content.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}