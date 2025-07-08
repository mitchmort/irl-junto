"use client";

import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { ReactNode } from "react";

const libraries: Libraries = ["places"];

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (loadError) {
    console.error("Error loading Google Maps:", loadError);
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading maps...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to check if Google Maps is loaded
export function useGoogleMapsLoaded() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  return { isLoaded, loadError };
}