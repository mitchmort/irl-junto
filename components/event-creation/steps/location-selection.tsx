"use client";

import { useState, useRef } from "react";
import { useEventCreationStore } from "@/store/event-creation";
import { SelectionCard } from "@/components/event-creation/selection-card";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { toast } from "@/components/ui/use-toast";

// Libraries to load for Google Maps
const libraries: ("places")[] = ["places"];

// Mock recent venues data - this would come from user's history
const recentVenues = [
  {
    placeId: 'place1',
    name: 'Downtown Sports Complex',
    address: '123 Main Street, Downtown',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    placeId: 'place2', 
    name: 'City Park Courts',
    address: '456 Oak Avenue, Midtown',
    coordinates: { lat: 37.7849, lng: -122.4094 }
  },
  {
    placeId: 'place3',
    name: 'YMCA Main Branch', 
    address: '789 Pine Street, Uptown',
    coordinates: { lat: 37.7949, lng: -122.3994 }
  }
];

export function LocationSelectionStep() {
  const { formData, updateField, nextStep, validateCurrentStep } = useEventCreationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const handleVenueSelect = (venue: typeof recentVenues[0]) => {
    updateField('location', venue);
    
    // Auto-advance
    setTimeout(() => {
      nextStep();
    }, 150);
  };

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    
    // Configure autocomplete options
    autocomplete.setOptions({
      types: ['establishment', 'geocode'],
      fields: ['place_id', 'name', 'formatted_address', 'geometry']
    });
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.place_id && place.formatted_address) {
        const location = {
          placeId: place.place_id,
          name: place.name || place.formatted_address,
          address: place.formatted_address,
          coordinates: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : undefined
        };
        
        updateField('location', location);
        
        // Auto-advance
        setTimeout(() => {
          nextStep();
        }, 150);
      } else {
        toast({
          title: "Invalid location",
          description: "Please select a valid location from the suggestions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value.length > 0);
  };

  // Show loading state if Google Maps is still loading
  if (!isLoaded && !loadError) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            Where?
          </h1>
          <p className="text-muted-foreground">
            Loading location search...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show error state if Google Maps failed to load
  if (loadError) {
    console.error("Google Maps load error:", loadError);
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Where?
        </h1>
        <p className="text-muted-foreground">
          Choose your venue location
        </p>
      </div>

      <div className="space-y-4">
        {/* Search Input with Autocomplete */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Search venues</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
            {isLoaded && !loadError ? (
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <Input
                  ref={inputRef}
                  placeholder="Search for a venue or address..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="h-14 pl-10 text-lg"
                />
              </Autocomplete>
            ) : (
              <Input
                placeholder="Search for a venue..."
                value={searchQuery}
                onChange={handleInputChange}
                className="h-14 pl-10 text-lg"
                disabled={!!loadError}
              />
            )}
          </div>
          {loadError && (
            <p className="text-sm text-destructive">
              Location search is currently unavailable. Please try again later.
            </p>
          )}
        </div>

        {/* Recent Venues */}
        {!isSearching && recentVenues.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Recent venues
            </Label>
            
            {recentVenues.map((venue) => (
              <SelectionCard
                key={venue.placeId}
                icon="📍"
                title={venue.name}
                subtitle={venue.address}
                selected={formData.location?.placeId === venue.placeId}
                onClick={() => handleVenueSelect(venue)}
                className="transition-transform duration-150 hover:scale-[1.02]"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isSearching && recentVenues.length === 0 && (
          <Card className="p-6 text-center border-dashed">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Search for a venue above to get started
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}