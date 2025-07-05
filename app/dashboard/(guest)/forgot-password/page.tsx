"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2Icon, MailIcon, CheckCircleIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { handleError } from "@/lib/error-handler";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center py-4 lg:h-screen">
        <Card className="mx-auto w-96">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <p className="text-sm">
              Remember your password?{" "}
              <a href="/dashboard/login/v2" className="underline">
                Back to login
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email" className="sr-only">
                      Email address
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform opacity-30" />
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="email"
                          className="w-full pl-10"
                          placeholder="Enter your email address"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="animate-spin h-4 w-4 mr-2" />
                    Sending Instructions...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            Remember your password?{" "}
            <a href="/dashboard/login/v2" className="underline">
              Back to login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
