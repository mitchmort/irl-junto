"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventCreationStore } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

export function AdditionalDetailsStep() {
  const router = useRouter();
  const { 
    formData, 
    updateFormData, 
    setSubmitting, 
    isSubmitting,
    resetForm 
  } = useEventCreationStore();
  
  const [equipment, setEquipment] = useState(formData.equipment || '');
  const [arrivalInstructions, setArrivalInstructions] = useState(formData.arrivalInstructions || '');

  const handleEquipmentChange = (value: string) => {
    setEquipment(value);
    updateFormData({ equipment: value });
  };

  const handleArrivalChange = (value: string) => {
    setArrivalInstructions(value);
    updateFormData({ arrivalInstructions: value });
  };

  const handleSkip = async () => {
    await submitEvent();
  };

  const handleComplete = async () => {
    // Update final details
    updateFormData({
      equipment: equipment.trim(),
      arrivalInstructions: arrivalInstructions.trim()
    });
    
    await submitEvent();
  };

  const submitEvent = async () => {
    setSubmitting(true);
    
    try {
      // TODO: Replace with actual Supabase submission
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      toast({
        title: "Event Created!",
        description: "Your event has been successfully created and is ready to share.",
      });
      
      // Reset form and redirect
      resetForm();
      router.push('/dashboard/events?created=true');
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">
              Creating your event...
            </h1>
            <p className="text-muted-foreground mt-2">
              This will only take a moment
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Validating event details</span>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Creating event page</span>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="h-5 w-5 border-2 border-muted rounded-full" />
              <span className="text-sm text-muted-foreground">Generating share link</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Any special details?
        </h1>
        <p className="text-muted-foreground">
          Optional information for participants
        </p>
      </div>

      <div className="space-y-6">
        {/* Equipment Section */}
        <div className="space-y-3">
          <Label htmlFor="equipment" className="text-base font-medium">
            Equipment needed
          </Label>
          <Textarea
            id="equipment"
            placeholder="e.g., Bring your own basketball"
            value={equipment}
            onChange={(e) => handleEquipmentChange(e.target.value)}
            maxLength={100}
            rows={3}
            className="resize-none text-base"
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
        <div className="space-y-3">
          <Label htmlFor="arrival" className="text-base font-medium">
            Arrival instructions
          </Label>
          <Textarea
            id="arrival"
            placeholder="e.g., Meet at the main entrance"
            value={arrivalInstructions}
            onChange={(e) => handleArrivalChange(e.target.value)}
            maxLength={100}
            rows={3}
            className="resize-none text-base"
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 h-14 text-lg"
          onClick={handleSkip}
          disabled={isSubmitting}
        >
          Skip
        </Button>
        <Button
          className="flex-1 h-14 text-lg"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          Create Event
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-center text-muted-foreground">
        You can always edit these details later
      </p>
    </div>
  );
}