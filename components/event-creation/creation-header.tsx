"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, X } from "lucide-react";

interface CreationHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onCancel: () => void;
  canGoBack: boolean;
  title?: string;
}

export function CreationHeader({
  currentStep,
  totalSteps,
  onBack,
  onCancel,
  canGoBack,
  title
}: CreationHeaderProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b z-50 safe-area-top">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={canGoBack ? onBack : onCancel}
          className="flex items-center gap-2 touch-manipulation"
        >
          {canGoBack ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              Back
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          )}
        </Button>

        {title && (
          <h1 className="text-sm font-medium text-center flex-1 mx-4 truncate">
            {title}
          </h1>
        )}

        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <Progress 
          value={progressPercentage} 
          className="h-1"
        />
      </div>
    </header>
  );
}