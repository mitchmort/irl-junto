"use client";

import { useState } from "react";
import { useEventCreationStore, sportDefaults } from "@/store/event-creation";
import { SelectionCard } from "@/components/event-creation/selection-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function FormatSelectionStep() {
  const { formData, updateFormData, nextStep } = useEventCreationStore();
  const [isCustom, setIsCustom] = useState(formData.isCustomFormat || false);
  const [customText, setCustomText] = useState(formData.customFormatText || '');

  // Get format options for the selected sport
  const sportConfig = sportDefaults[formData.sport as keyof typeof sportDefaults];
  const formats = sportConfig?.formats || [];

  const handleFormatSelect = (formatId: string) => {
    const selectedFormat = formats.find(f => f.id === formatId);
    
    updateFormData({
      format: formatId,
      isCustomFormat: false,
      customFormatText: '',
      // Update total players based on format if specified
      ...(selectedFormat?.players && { totalPlayers: selectedFormat.players })
    });
    
    // Auto-advance
    setTimeout(() => {
      nextStep();
    }, 150);
  };

  const handleCustomFormat = () => {
    setIsCustom(true);
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      updateFormData({
        format: customText.trim(),
        isCustomFormat: true,
        customFormatText: customText.trim()
      });
      
      nextStep();
    }
  };

  const handleCustomChange = (value: string) => {
    setCustomText(value);
  };

  // Get sport display name
  const getSportDisplayName = () => {
    const sportNames = {
      basketball: 'Basketball',
      tennis: 'Tennis',
      pickleball: 'Pickleball',
      volleyball: 'Volleyball',
      soccer: 'Soccer',
      climbing: 'Rock Climbing'
    };
    return sportNames[formData.sport as keyof typeof sportNames] || 'Event';
  };

  if (isCustom) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {getSportDisplayName()} Format?
          </h1>
          <p className="text-muted-foreground">
            Enter your custom format
          </p>
        </div>

        <Card className="p-4 ring-2 ring-primary">
          <Input
            autoFocus
            placeholder="e.g., King of the Court"
            value={customText}
            onChange={(e) => handleCustomChange(e.target.value)}
            maxLength={30}
            className="text-lg h-12 border-0 p-0 focus:ring-0 bg-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customText.trim()) {
                handleCustomSubmit();
              }
            }}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {customText.length}/30 characters
          </p>
        </Card>

        <div className="space-y-3">
          <Button 
            className="w-full h-14 text-lg" 
            disabled={!customText.trim()}
            onClick={handleCustomSubmit}
          >
            Next →
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12" 
            onClick={() => {
              setIsCustom(false);
              setCustomText('');
            }}
          >
            Back to presets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          {getSportDisplayName()} Format?
        </h1>
        <p className="text-muted-foreground">
          Choose how you want to play
        </p>
      </div>

      <div className="space-y-3">
        {formats.map((format) => (
          <SelectionCard
            key={format.id}
            title={format.name}
            subtitle={format.description}
            selected={formData.format === format.id && !formData.isCustomFormat}
            onClick={() => handleFormatSelect(format.id)}
            className="transition-transform duration-150 hover:scale-[1.02]"
          />
        ))}
        
        <SelectionCard
          icon="✏️"
          title="Custom Format"
          subtitle="Type your own"
          onClick={handleCustomFormat}
          className="transition-transform duration-150 hover:scale-[1.02]"
        />
      </div>
    </div>
  );
}