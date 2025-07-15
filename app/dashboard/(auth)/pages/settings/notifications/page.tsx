"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { PhoneVerification } from "@/components/auth/phone-verification";
import { formatPhoneNumberForDisplay } from "@/lib/twilio/phone-utils";
import { MessageSquare, Bell, Shield, Clock, MapPin, Users, Phone } from "lucide-react";

const notificationsFormSchema = z.object({
  type: z.enum(["all", "mentions", "none"], {
    required_error: "You need to select a notification type."
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
  // SMS notification preferences
  sms_reminders: z.boolean().default(true).optional(),
  sms_event_updates: z.boolean().default(true).optional(),
  sms_organizer_messages: z.boolean().default(true).optional(),
  reminder_24h: z.boolean().default(true).optional(),
  reminder_2h: z.boolean().default(true).optional(),
  timezone: z.string().optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
  social_emails: true,
  security_emails: true,
  sms_reminders: true,
  sms_event_updates: true,
  sms_organizer_messages: true,
  reminder_24h: true,
  reminder_2h: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export default function Page() {
  const { user } = useAuth();
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  
  const {
    preferences,
    loading: preferencesLoading,
    updating,
    error: preferencesError,
    updatePreferences,
  } = useNotificationPreferences(user?.id || '');

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      form.reset({
        ...defaultValues,
        sms_reminders: preferences.sms_reminders ?? true,
        sms_event_updates: preferences.sms_event_updates ?? true,
        sms_organizer_messages: preferences.sms_organizer_messages ?? true,
        reminder_24h: preferences.reminder_24h ?? true,
        reminder_2h: preferences.reminder_2h ?? true,
        timezone: preferences.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [preferences, form]);

  // Check user phone verification status
  useEffect(() => {
    if (user) {
      // This would typically come from the user object
      // For now, we'll assume it's available in the auth context
      setPhoneVerified(user.phone_verified || false);
      setUserPhone(user.phone_number || null);
    }
  }, [user]);

  function onSubmit(data: NotificationsFormValues) {
    if (!user) return;

    // Update SMS preferences
    updatePreferences({
      sms_reminders: data.sms_reminders,
      sms_event_updates: data.sms_event_updates,
      sms_organizer_messages: data.sms_organizer_messages,
      reminder_24h: data.reminder_24h,
      reminder_2h: data.reminder_2h,
      timezone: data.timezone,
    }).then((success) => {
      if (success) {
        toast({
          title: "Notification preferences updated",
          description: "Your notification settings have been saved successfully.",
        });
      } else {
        toast({
          title: "Error updating preferences",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  const handlePhoneVerificationComplete = (phoneNumber: string) => {
    setPhoneVerified(true);
    setUserPhone(phoneNumber);
    setShowPhoneVerification(false);
    toast({
      title: "Phone verified successfully",
      description: "You can now receive SMS notifications.",
    });
  };

  const timezones = [
    { label: "Eastern Time", value: "America/New_York" },
    { label: "Central Time", value: "America/Chicago" },
    { label: "Mountain Time", value: "America/Denver" },
    { label: "Pacific Time", value: "America/Los_Angeles" },
    { label: "UTC", value: "UTC" },
  ];

  if (showPhoneVerification) {
    return (
      <div className="max-w-md mx-auto">
        <PhoneVerification
          userId={user?.id || ''}
          onVerificationComplete={handlePhoneVerificationComplete}
          onCancel={() => setShowPhoneVerification(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phone Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {phoneVerified ? "Phone Verified" : "Phone Not Verified"}
              </p>
              <p className="text-sm text-muted-foreground">
                {phoneVerified && userPhone 
                  ? `SMS notifications will be sent to ${formatPhoneNumberForDisplay(userPhone)}`
                  : "Phone verification is required to receive SMS notifications"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {phoneVerified ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Not Verified
                </Badge>
              )}
              {!phoneVerified && (
                <Button
                  onClick={() => setShowPhoneVerification(true)}
                  size="sm"
                >
                  Verify Phone
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Notification Settings */}
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* SMS Notifications Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="text-lg font-medium">SMS Notifications</h3>
                </div>
                
                {!phoneVerified && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      Phone verification is required to receive SMS notifications.{" "}
                      <Button
                        variant="link"
                        onClick={() => setShowPhoneVerification(true)}
                        className="p-0 h-auto"
                      >
                        Verify your phone number
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sms_reminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Event Reminders
                          </FormLabel>
                          <FormDescription>
                            Receive SMS reminders for upcoming events
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            disabled={!phoneVerified || updating}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Reminder timing options */}
                  <div className="ml-4 space-y-3">
                    <FormField
                      control={form.control}
                      name="reminder_24h"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">24-hour reminder</FormLabel>
                            <FormDescription className="text-xs">
                              Get reminded 24 hours before events
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              disabled={!phoneVerified || !form.watch('sms_reminders') || updating}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reminder_2h"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">2-hour reminder</FormLabel>
                            <FormDescription className="text-xs">
                              Get reminded 2 hours before events
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              disabled={!phoneVerified || !form.watch('sms_reminders') || updating}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sms_event_updates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Event Updates
                          </FormLabel>
                          <FormDescription>
                            Get notified about changes to event time, location, or cancellations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            disabled={!phoneVerified || updating}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sms_organizer_messages"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Organizer Messages
                          </FormLabel>
                          <FormDescription>
                            Receive messages from event organizers
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            disabled={!phoneVerified || updating}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Timezone</FormLabel>
                          <FormDescription>
                            Choose your timezone for accurate reminder timing
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Email Notifications Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="communication_emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Communication emails</FormLabel>
                          <FormDescription>
                            Receive emails about your account activity.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marketing_emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Marketing emails</FormLabel>
                          <FormDescription>
                            Receive emails about new products, features, and more.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Social emails</FormLabel>
                          <FormDescription>
                            Receive emails for friend requests, follows, and more.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="security_emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security emails
                          </FormLabel>
                          <FormDescription>
                            Receive emails about your account activity and security.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Settings */}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none ml-3">
                      <FormLabel>Use different settings for my mobile devices</FormLabel>
                      <FormDescription>
                        You can manage your mobile notifications in the{" "}
                        <Link href="/examples/forms">mobile settings</Link> page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {preferencesError && (
                <Alert variant="destructive">
                  <AlertDescription>{preferencesError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={updating || preferencesLoading}>
                {updating ? 'Updating...' : 'Update notifications'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
