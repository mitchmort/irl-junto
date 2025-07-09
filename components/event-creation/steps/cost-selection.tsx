"use client";

import { useState, useEffect } from "react";
import { useEventCreationStore } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Globe, Lock } from "lucide-react";

const quickCostOptions = [
  { value: 0, label: 'Free' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
  { value: 15, label: '$15' },
  { value: 20, label: '$20' }
];

export function CostSelectionStep() {
  const { formData, updateFormData, nextStep, validateCurrentStep } = useEventCreationStore();
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [description, setDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Sync local state with store state on component mount
  useEffect(() => {
    setDescription(formData.description || '');
    setAdditionalDetails(formData.additionalDetails || '');
  }, [formData.description, formData.additionalDetails]);

  const handleQuickCostSelect = (cost: number) => {
    updateFormData({ cost });
    setIsCustom(false);
    setCustomAmount('');
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
      updateFormData({ cost: numericValue });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    updateFormData({ description: value });
  };

  const handleAdditionalDetailsChange = (value: string) => {
    setAdditionalDetails(value);
    updateFormData({ additionalDetails: value });
  };

  const handleNext = () => {
    // Update final details before proceeding
    updateFormData({
      description: description.trim(),
      additionalDetails: additionalDetails.trim()
    });
    
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Details & Cost
        </h1>
        <p className="text-muted-foreground">
          Add event description and pricing
        </p>
      </div>

      <div className="space-y-6">
        {/* Event Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <Label htmlFor="description" className="text-base font-medium">
              About this event
            </Label>
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          </div>
          <Textarea
            id="description"
            placeholder="Tell everyone what this event is about..."
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            maxLength={300}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              This description will be visible to everyone who views your event
            </p>
            <Badge variant="outline" className="text-xs">
              {description.length}/300
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Cost Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Cost per person</Label>
          
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
        </div>

        <Separator />

        {/* Additional Details for Confirmed Players */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <Label htmlFor="details" className="text-base font-medium">
                Extra details for confirmed players
              </Label>
              <Badge variant="outline" className="text-xs">
                Private
              </Badge>
            </div>
            <Textarea
              id="details"
              placeholder="e.g., Bring your own basketball, meet at the main entrance, my phone number..."
              value={additionalDetails}
              onChange={(e) => handleAdditionalDetailsChange(e.target.value)}
              maxLength={200}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Equipment needed, arrival instructions, or other info only for confirmed players
              </p>
              <Badge variant="outline" className="text-xs">
                {additionalDetails.length}/200
              </Badge>
            </div>
          </div>
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