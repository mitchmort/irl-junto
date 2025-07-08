"use client";

import { useState } from "react";
import { useEventCreationStore } from "@/store/event-creation";
import { SelectionCard } from "@/components/event-creation/selection-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, MapPin } from "lucide-react";

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
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof recentVenues>([]);

  const handleVenueSelect = (venue: typeof recentVenues[0]) => {
    updateField('location', venue);
    
    // Auto-advance
    setTimeout(() => {
      nextStep();
    }, 150);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length > 2) {
      setIsSearchMode(true);
      // TODO: Replace with Google Places API call
      // For now, filter recent venues
      const filtered = recentVenues.filter(venue => 
        venue.name.toLowerCase().includes(value.toLowerCase()) ||
        venue.address.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  const handleManualEntry = () => {
    if (searchQuery.trim()) {
      const manualLocation = {
        placeId: `manual_${Date.now()}`,
        name: searchQuery.trim(),
        address: searchQuery.trim(),
        coordinates: { lat: 0, lng: 0 } // Would be geocoded in real implementation
      };
      
      updateField('location', manualLocation);
      
      setTimeout(() => {
        nextStep();
      }, 150);
    }
  };

  const displayVenues = isSearchMode ? searchResults : recentVenues;

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
        {/* Search Input */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Search venues</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for a venue..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-14 pl-10 text-lg"
            />
          </div>
        </div>

        {/* Manual entry option for search */}
        {searchQuery.length > 2 && searchResults.length === 0 && (
          <Card className="p-4 border-dashed">
            <div className="text-center space-y-3">
              <MapPin className="h-6 w-6 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">Can't find your venue?</p>
                <p className="text-sm text-muted-foreground">Use "{searchQuery}" as location</p>
              </div>
              <Button onClick={handleManualEntry} className="w-full">
                Use This Location
              </Button>
            </div>
          </Card>
        )}

        {/* Venue List */}
        <div className="space-y-3">
          {!isSearchMode && recentVenues.length > 0 && (
            <Label className="text-sm text-muted-foreground">
              Recent venues
            </Label>
          )}
          
          {isSearchMode && searchResults.length > 0 && (
            <Label className="text-sm text-muted-foreground">
              Search results
            </Label>
          )}

          {displayVenues.map((venue) => (
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

          {/* Empty state */}
          {!isSearchMode && recentVenues.length === 0 && (
            <Card className="p-6 text-center border-dashed">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Search for a venue above to get started
              </p>
            </Card>
          )}

          {isSearchMode && searchResults.length === 0 && searchQuery.length <= 2 && (
            <Card className="p-6 text-center border-dashed">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Keep typing to search for venues...
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}