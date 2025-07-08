"use client";

import { useEventCreationStore, sportDefaults } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function PlayerCountStep() {
  const { formData, updateFormData, nextStep, validateCurrentStep } = useEventCreationStore();

  // Get constraints for the selected sport
  const sportConfig = sportDefaults[formData.sport as keyof typeof sportDefaults];
  
  // Set min/max players based on sport and format
  const getPlayerConstraints = () => {
    let minPlayers = 2;
    let maxPlayers = 40;
    
    if (sportConfig) {
      // Try to find format-specific constraints
      const formatConfig = sportConfig.formats.find(f => f.id === formData.format);
      if (formatConfig?.players) {
        minPlayers = Math.max(2, Math.floor(formatConfig.players / 2));
        maxPlayers = formatConfig.players;
      } else {
        maxPlayers = sportConfig.defaultPlayers * 2; // Allow up to 2x default
      }
    }
    
    return { minPlayers, maxPlayers };
  };

  const { minPlayers, maxPlayers } = getPlayerConstraints();

  const handleTotalPlayersChange = (increment: boolean) => {
    const newTotal = increment 
      ? Math.min(formData.totalPlayers + 1, maxPlayers)
      : Math.max(formData.totalPlayers - 1, Math.max(minPlayers, formData.playersConfirmed));
    
    updateFormData({ totalPlayers: newTotal });
  };

  const handleConfirmedPlayersChange = (increment: boolean) => {
    const newConfirmed = increment 
      ? Math.min(formData.playersConfirmed + 1, formData.totalPlayers)
      : Math.max(formData.playersConfirmed - 1, 1); // At least 1 (organizer)
    
    updateFormData({ playersConfirmed: newConfirmed });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const playersNeeded = formData.totalPlayers - formData.playersConfirmed;
  const canProceed = formData.totalPlayers >= formData.playersConfirmed && formData.playersConfirmed >= 1;

  const getFormatDescription = () => {
    if (formData.isCustomFormat) {
      return formData.customFormatText;
    }
    
    const sportName = {
      basketball: 'Basketball',
      tennis: 'Tennis',
      pickleball: 'Pickleball', 
      volleyball: 'Volleyball',
      soccer: 'Soccer',
      climbing: 'Rock Climbing'
    }[formData.sport as keyof typeof sportDefaults] || '';
    
    return `${sportName} ${formData.format}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          How many players?
        </h1>
        <p className="text-muted-foreground">
          Set your player count
        </p>
      </div>

      <div className="space-y-6">
        {/* Total Players Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Total Players Needed</Label>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={() => handleTotalPlayersChange(false)}
                disabled={formData.totalPlayers <= Math.max(minPlayers, formData.playersConfirmed)}
              >
                <Minus className="h-6 w-6" />
              </Button>
              
              <div className="text-center">
                <div className="text-3xl font-bold">{formData.totalPlayers}</div>
                <div className="text-sm text-muted-foreground">players</div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={() => handleTotalPlayersChange(true)}
                disabled={formData.totalPlayers >= maxPlayers}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </Card>
          
          <p className="text-sm text-muted-foreground text-center">
            For {getFormatDescription()}
          </p>
        </div>

        <Separator />

        {/* Confirmed Players Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Already Confirmed</Label>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={() => handleConfirmedPlayersChange(false)}
                disabled={formData.playersConfirmed <= 1}
              >
                <Minus className="h-6 w-6" />
              </Button>
              
              <div className="text-center">
                <div className="text-3xl font-bold">{formData.playersConfirmed}</div>
                <div className="text-sm text-muted-foreground">confirmed</div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={() => handleConfirmedPlayersChange(true)}
                disabled={formData.playersConfirmed >= formData.totalPlayers}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </Card>
          
          <p className="text-sm text-muted-foreground text-center">
            Including yourself
          </p>
        </div>

        {/* Summary */}
        {playersNeeded > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 justify-center">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-center">
                <div className="font-semibold text-primary">
                  Need {playersNeeded} more {playersNeeded === 1 ? 'player' : 'players'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.playersConfirmed} of {formData.totalPlayers} confirmed
                </div>
              </div>
            </div>
          </Card>
        )}

        {playersNeeded === 0 && (
          <Card className="p-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center gap-3 justify-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Users className="h-4 w-4 mr-1" />
                Event Full!
              </Badge>
            </div>
          </Card>
        )}
      </div>

      <Button 
        className="w-full h-14 text-lg" 
        disabled={!canProceed}
        onClick={handleNext}
      >
        Next →
      </Button>
    </div>
  );
}