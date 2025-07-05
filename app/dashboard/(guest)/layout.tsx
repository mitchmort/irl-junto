import React from "react";
import AuthGuard from "@/components/auth/auth-guard";

export default function GuestLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard requireAuth={false}>
      {children}
    </AuthGuard>
  );
}
