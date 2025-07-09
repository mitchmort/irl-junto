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
  fullAddress?: string; // Add full address prop for better map accuracy
}

export default function EventMapLocation({ 
  address, 
  city, 
  zip, 
  venueName,
  fullAddress 
}: EventMapLocationProps) {
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  // Construct full address for display and encoding
  // Use provided fullAddress if available, otherwise construct from parts
  const displayAddress = fullAddress || `${address}, ${city} ${zip}`.replace(/,\s*$/, '').replace(/,\s*,/g, ',');
  
  // Don't encode if address is empty or invalid
  if (!displayAddress || displayAddress.trim() === '' || displayAddress.trim() === ',') {
    console.warn('Empty or invalid address provided for map');
  }
  
  const encodedAddress = encodeURIComponent(displayAddress || 'Location not specified');

  // Google Maps API key from environment variables
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Check if API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
  } else {
    console.log('Google Maps API key loaded successfully');
  }
  
  // Debug logging
  console.log('Map component received:', { address, city, zip, venueName, fullAddress });
  console.log('Display address:', displayAddress);
  console.log('Encoded address:', encodedAddress);
  
  // Google Maps embed URL with API key for enhanced functionality
  const mapEmbedUrl = GOOGLE_MAPS_API_KEY 
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=15&maptype=roadmap`
    : `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`; // Fallback without API key
  
  console.log('Map embed URL:', mapEmbedUrl);

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
        await navigator.clipboard.writeText(displayAddress);
        toast({
          title: "Address copied!",
          description: "Event address has been copied to your clipboard.",
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = displayAddress;
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
    <div className="sticky top-20 space-y-3">
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
            
            {mapError || !GOOGLE_MAPS_API_KEY || !displayAddress || displayAddress.trim() === '' || displayAddress.trim() === ',' ? (
              <div className="flex h-full items-center justify-center bg-muted rounded-lg">
                <div className="text-center space-y-2">
                  <MapPin className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {!GOOGLE_MAPS_API_KEY ? 'Map temporarily unavailable' : 'Unable to load map'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the address below to find directions
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
                aria-label={`Map showing location of event at ${displayAddress}`}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Details Card */}
      <Card>
        <CardContent className="space-y-3 p-4">
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