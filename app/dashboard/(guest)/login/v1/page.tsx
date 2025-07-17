'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to SMS login since email authentication is no longer supported
    router.replace("/dashboard/login/sms");
  }, [router]);

  return null;
}
