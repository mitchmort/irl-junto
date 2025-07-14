"use client";

import { useEffect } from "react";

export function ErrorSuppressionClient() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Suppress known development-only errors that don't affect functionality
      const originalError = console.error;
      console.error = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('blob:') || 
           message.includes('Failed to load resource') ||
           message.includes('net::ERR_FILE_NOT_FOUND'))
        ) {
          // These are typically harmless blob URL cleanup errors during development
          return;
        }
        originalError(...args);
      };
    }
  }, []);

  return null;
}