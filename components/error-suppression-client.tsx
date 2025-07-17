"use client";

import { useEffect } from "react";

export function ErrorSuppressionClient() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Suppress known development-only errors that don't affect functionality
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('blob:') || 
           message.includes('Failed to load resource') ||
           message.includes('net::ERR_FILE_NOT_FOUND') ||
           message.includes('ERR_NETWORK') ||
           message.includes('blob URL') ||
           message.includes('createObjectURL'))
        ) {
          // These are typically harmless blob URL cleanup errors during development
          return;
        }
        originalError(...args);
      };
      
      console.warn = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('blob:') || 
           message.includes('URL.createObjectURL'))
        ) {
          // Suppress blob URL warnings in development
          return;
        }
        originalWarn(...args);
      };
      
      // Suppress unhandled promise rejections related to blob URLs
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason;
        if (
          error && 
          typeof error.message === 'string' &&
          (error.message.includes('blob:') || 
           error.message.includes('Failed to load resource'))
        ) {
          event.preventDefault();
          return;
        }
      };
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      // Cleanup on unmount
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return null;
}