"use client";

import { useState } from "react";
import { useEventCreationStore } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

const quickCostOptions = [
  { value: 0, label: 'Free' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
  { value: 15, label: '$15' },
  { value: 20, label: '$20' }
];

export function CostSelectionStep() {
  const { formData, updateField, nextStep, validateCurrentStep } = useEventCreationStore();
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleQuickCostSelect = (cost: number) => {
    updateField('cost', cost);
    setIsCustom(false);
    setCustomAmount('');
    
    // Auto-advance for quick selections
    setTimeout(() => {
      nextStep();
    }, 150);
  };

  const handleCustomCostSelect = () => {
    setIsCustom(true);
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setCustomAmount(cleanValue);
    
    const numericValue = parseFloat(cleanValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      updateField('cost', numericValue);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

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

  const getFormatDisplay = () => {
    return formData.isCustomFormat ? formData.customFormatText : formData.format;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const playersNeeded = formData.totalPlayers - formData.playersConfirmed;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Cost per person?
        </h1>
        <p className="text-muted-foreground">
          Set the price for your event
        </p>
      </div>

      <div className="space-y-6">
        {/* Quick Cost Options */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {quickCostOptions.map((option) => (
              <Button
                key={option.value}
                variant={formData.cost === option.value && !isCustom ? "default" : "outline"}
                className="h-14 text-lg"
                onClick={() => handleQuickCostSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Card className={`p-4 cursor-pointer transition-all duration-200 ${
          isCustom ? 'ring-2 ring-primary border-primary' : 'hover:border-primary'
        }`} onClick={handleCustomCostSelect}>
          <div className="flex items-center gap-4">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-base font-medium">Other amount</Label>
              {isCustom ? (
                <Input
                  type="text"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="mt-2 text-lg h-12"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Enter custom amount
                </p>
              )}
            </div>
          </div>
        </Card>

        <Separator />

        {/* Event Summary */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            📋 Event Summary
          </Label>
          
          <Card className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {getSportDisplayName()} {getFormatDisplay()}
              </h3>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                {formData.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(formData.date, 'EEE, MMM d')}</span>
                    {formData.startTime && (
                      <>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{formatTime(formData.startTime)}</span>
                      </>
                    )}
                  </div>
                )}
                
                {formData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{formData.location.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {playersNeeded > 0 
                      ? `Need ${playersNeeded} more player${playersNeeded === 1 ? '' : 's'}`
                      : 'Event full'
                    }
                  </span>
                  <span className="text-xs">•</span>
                  <span>
                    {formData.cost === 0 ? 'Free' : `$${formData.cost} each`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Button 
        className="w-full h-14 text-lg" 
        onClick={handleNext}
      >
        Next →
      </Button>
    </div>
  );
}