"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEventCreationStore } from "@/store/event-creation";
import { CreationHeader } from "@/components/event-creation/creation-header";
import { StepSkeleton } from "@/components/event-creation/step-skeleton";

// Step components
import { SportSelectionStep } from "@/components/event-creation/steps/sport-selection";
import { FormatSelectionStep } from "@/components/event-creation/steps/format-selection";
import { SkillLevelStep } from "@/components/event-creation/steps/skill-level";
import { DateSelectionStep } from "@/components/event-creation/steps/date-selection";
import { TimeSelectionStep } from "@/components/event-creation/steps/time-selection";
import { PlayerCountStep } from "@/components/event-creation/steps/player-count";
import { LocationSelectionStep } from "@/components/event-creation/steps/location-selection";
import { CostSelectionStep } from "@/components/event-creation/steps/cost-selection";
import { EventSummaryStep } from "@/components/event-creation/steps/event-summary";
import { SuccessScreen } from "@/components/event-creation/success-screen";

function EventCreationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    currentStep,
    totalSteps,
    setCurrentStep,
    previousStep,
    resetForm,
    canAdvanceToStep,
    showSuccessScreen,
    createdEventId,
    createdEventSlug,
    formData
  } = useEventCreationStore();

  // Sync URL with current step
  useEffect(() => {
    const stepParam = searchParams.get('step');
    const stepNumber = stepParam ? parseInt(stepParam, 10) : 1;
    
    if (stepNumber >= 1 && stepNumber <= totalSteps && canAdvanceToStep(stepNumber)) {
      setCurrentStep(stepNumber);
    } else {
      // Invalid step, redirect to step 1
      router.replace('/dashboard/events/create?step=1');
    }
  }, [searchParams, setCurrentStep, totalSteps, canAdvanceToStep, router]);

  // Update URL when step changes
  useEffect(() => {
    const currentStepParam = searchParams.get('step');
    if (currentStepParam !== currentStep.toString()) {
      router.replace(`/dashboard/events/create?step=${currentStep}`);
    }
  }, [currentStep, router, searchParams]);

  const handleBack = () => {
    if (currentStep > 1) {
      previousStep();
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push('/dashboard/events');
  };

  const getStepTitle = (step: number): string => {
    const titles = {
      1: "Choose Sport",
      2: "Event Format",
      3: "Skill Level",
      4: "Event Date",
      5: "Time & Duration",
      6: "Player Count",
      7: "Location",
      8: "Cost & Details",
      9: "Review & Create"
    };
    return titles[step as keyof typeof titles] || "";
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SportSelectionStep />;
      case 2:
        return <FormatSelectionStep />;
      case 3:
        return <SkillLevelStep />;
      case 4:
        return <DateSelectionStep />;
      case 5:
        return <TimeSelectionStep />;
      case 6:
        return <PlayerCountStep />;
      case 7:
        return <LocationSelectionStep />;
      case 8:
        return <CostSelectionStep />;
      case 9:
        return <EventSummaryStep />;
      default:
        return <div>Invalid step</div>;
    }
  };

  // Show success screen if event was created
  if (showSuccessScreen && createdEventId && createdEventSlug) {
    return (
      <div className="min-h-screen bg-background event-creation-container">
        <main className="pt-8 px-4 pb-8 safe-area-bottom">
          <div className="max-w-md mx-auto">
            <SuccessScreen 
              eventData={{
                id: createdEventId,
                slug: createdEventSlug,
                sport: formData.sport,
                format: formData.isCustomFormat ? formData.customFormatText || '' : formData.format,
                date: formData.date || new Date(),
                startTime: formData.startTime,
                location: formData.location || { name: '' },
                totalPlayers: formData.totalPlayers,
                playersConfirmed: formData.playersConfirmed,
                cost: formData.cost
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background event-creation-container">
      {/* Fixed header */}
      <CreationHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        onCancel={handleCancel}
        canGoBack={currentStep > 1}
        title={getStepTitle(currentStep)}
      />

      {/* Main content with padding for fixed header */}
      <main className="pt-20 px-4 pb-8 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                duration: 0.2, 
                ease: "easeInOut" 
              }}
              className="w-full"
            >
              <Suspense fallback={<StepSkeleton />}>
                {renderStep()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventCreationContent />
    </Suspense>
  );
}