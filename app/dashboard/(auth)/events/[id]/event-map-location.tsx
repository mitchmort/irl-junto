"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MapPin, Copy, ExternalLink } from "lucide-react";

interface EventMapLocationProps {
  address: string;
  city: string;
  zip: string;
  venueName?: string;
}

export default function EventMapLocation({ 
  address, 
  city, 
  zip, 
  venueName 
}: EventMapLocationProps) {
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  // Construct full address for display and encoding
  const fullAddress = `${address}, ${city} ${zip}`;
  const encodedAddress = encodeURIComponent(fullAddress);

  // Google Maps API key from environment variables
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Check if API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
  } else {
    console.log('Google Maps API key loaded successfully');
  }
  
  // Google Maps embed URL with API key for enhanced functionality
  const mapEmbedUrl = GOOGLE_MAPS_API_KEY 
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=15&maptype=roadmap&center=${encodedAddress}`
    : `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`; // Fallback without API key

  // Handle map load success
  const handleMapLoad = () => {
    setIsMapLoading(false);
    setMapError(false);
  };

  // Handle map load error
  const handleMapError = () => {
    setIsMapLoading(false);
    setMapError(true);
  };

  // Copy address to clipboard
  const copyAddressToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullAddress);
        toast({
          title: "Address copied!",
          description: "Event address has been copied to your clipboard.",
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = fullAddress;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "Address copied!",
          description: "Event address has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Failed to copy address:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy address. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  // Open directions in Google Maps
  const openDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="sticky top-20 space-y-4">
      {/* Google Maps Embed Card */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-3/2 w-full lg:aspect-square">
            {isMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                <div className="animate-pulse">
                  <MapPin className="size-8 text-muted-foreground/50" />
                </div>
              </div>
            )}
            
            {mapError || !GOOGLE_MAPS_API_KEY ? (
              <div className="flex h-full items-center justify-center bg-muted rounded-lg">
                <div className="text-center space-y-2">
                  <MapPin className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {!GOOGLE_MAPS_API_KEY ? 'Map configuration needed' : 'Map unavailable'}
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                src={mapEmbedUrl}
                className="h-full w-full rounded-lg"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event Location Map"
                onLoad={handleMapLoad}
                onError={handleMapError}
                aria-label={`Map showing location of event at ${fullAddress}`}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Details Card */}
      <Card>
        <CardContent className="space-y-4">
          {/* Location header with icon */}
          <div className="flex items-start gap-3">
            <MapPin className="size-5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="space-y-1 flex-1 min-w-0">
              {venueName && (
                <h4 className="font-semibold text-sm lg:text-base truncate">{venueName}</h4>
              )}
              <div className="text-sm text-muted-foreground space-y-0.5">
                <div className="break-words">{address}</div>
                <div>{city} {zip}</div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyAddressToClipboard}
              className="w-full justify-center gap-2"
            >
              <Copy className="size-4" />
              Copy Address
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openDirections}
              className="w-full justify-center gap-2"
            >
              <ExternalLink className="size-4" />
              Get Directions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}