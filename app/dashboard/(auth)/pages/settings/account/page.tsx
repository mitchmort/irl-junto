"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, MailIcon, KeyIcon, PhoneIcon } from "lucide-react";

const accountFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  currentPassword: z.string().min(8, "Current password must be at least 8 characters."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Please confirm your new password.")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// Default values for form
const defaultValues: Partial<AccountFormValues> = {
  email: "",
  phone: "",
};

export default function Page() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues
  });

  function handleResetEmail() {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for password reset instructions."
    });
  }

  function handlePasswordChange(data: Pick<AccountFormValues, 'currentPassword' | 'newPassword' | 'confirmPassword'>) {
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed."
    });
    // Reset password fields
    form.setValue("currentPassword", "");
    form.setValue("newPassword", "");
    form.setValue("confirmPassword", "");
  }

  function handleContactUpdate(data: Pick<AccountFormValues, 'email' | 'phone'>) {
    toast({
      title: "Contact Information Updated",
      description: "Your email and phone number have been updated successfully."
    });
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Account & Privacy</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security, contact information, and privacy settings for JUNTO sports coordination.
        </p>
      </div>
      <Separator />



      {/* Account Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyIcon className="h-4 w-4" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reset Email */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Reset Password</h4>
              <p className="text-sm text-muted-foreground">
                Send a password reset link to your email address.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetEmail}
              className="flex items-center gap-2"
            >
              <MailIcon className="h-4 w-4" />
              Send Reset Email
            </Button>
          </div>

          <Separator />

          {/* Change Password */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Change Password</h4>
              <p className="text-sm text-muted-foreground">
                Update your account password for better security.
              </p>
            </div>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button"
                  onClick={() => handlePasswordChange({
                    currentPassword: form.getValues("currentPassword"),
                    newPassword: form.getValues("newPassword"),
                    confirmPassword: form.getValues("confirmPassword")
                  })}
                >
                  Update Password
                </Button>
              </div>
            </Form>
          </div>

          <Separator />

          {/* Change Email/Phone */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Contact Information</h4>
              <p className="text-sm text-muted-foreground">
                Update your email and phone number for account notifications and event coordination.
              </p>
            </div>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used for account notifications and event invitations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used for SMS notifications and emergency contact during events.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button"
                  onClick={() => handleContactUpdate({
                    email: form.getValues("email"),
                    phone: form.getValues("phone")
                  })}
                >
                  Update Contact Information
                </Button>
              </div>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
