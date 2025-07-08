"use client";

import { useState } from "react";
import { useEventCreationStore } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";

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
  const [equipment, setEquipment] = useState(formData.equipment || '');
  const [arrivalInstructions, setArrivalInstructions] = useState(formData.arrivalInstructions || '');

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

  const handleEquipmentChange = (value: string) => {
    setEquipment(value);
    updateFormData({ equipment: value });
  };

  const handleArrivalChange = (value: string) => {
    setArrivalInstructions(value);
    updateFormData({ arrivalInstructions: value });
  };

  const handleNext = () => {
    // Update final details before proceeding
    updateFormData({
      equipment: equipment.trim(),
      arrivalInstructions: arrivalInstructions.trim()
    });
    
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Cost & Details
        </h1>
        <p className="text-muted-foreground">
          Set pricing and optional details
        </p>
      </div>

      <div className="space-y-6">
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

        {/* Optional Details */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Optional Details
          </Label>
          
          {/* Equipment Section */}
          <div className="space-y-2">
            <Label htmlFor="equipment" className="text-sm">
              Equipment needed
            </Label>
            <Textarea
              id="equipment"
              placeholder="e.g., Bring your own basketball"
              value={equipment}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              maxLength={100}
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Let players know what to bring
              </p>
              <Badge variant="outline" className="text-xs">
                {equipment.length}/100
              </Badge>
            </div>
          </div>

          {/* Arrival Instructions Section */}
          <div className="space-y-2">
            <Label htmlFor="arrival" className="text-sm">
              Arrival instructions
            </Label>
            <Textarea
              id="arrival"
              placeholder="e.g., Meet at the main entrance"
              value={arrivalInstructions}
              onChange={(e) => handleArrivalChange(e.target.value)}
              maxLength={100}
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Help players find the right spot
              </p>
              <Badge variant="outline" className="text-xs">
                {arrivalInstructions.length}/100
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