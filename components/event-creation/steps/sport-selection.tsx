"use client";

import { useEventCreationStore, sportDefaults } from "@/store/event-creation";
import { SelectionCard } from "@/components/event-creation/selection-card";

const sports = [
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'climbing', name: 'Rock Climbing', icon: '🧗' }
];

export function SportSelectionStep() {
  const { formData, updateField, nextStep } = useEventCreationStore();

  const handleSportSelect = (sportId: string) => {
    // Update sport selection
    updateField('sport', sportId);
    
    // Set sport-specific defaults
    const defaults = sportDefaults[sportId as keyof typeof sportDefaults];
    if (defaults) {
      updateField('totalPlayers', defaults.defaultPlayers);
      updateField('duration', defaults.defaultDuration);
    }
    
    // Auto-advance to next step
    setTimeout(() => {
      nextStep();
    }, 150); // Small delay for visual feedback
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          What sport are you organizing?
        </h1>
        <p className="text-muted-foreground">
          Choose the sport for your event
        </p>
      </div>

      <div className="space-y-3">
        {sports.map((sport) => (
          <SelectionCard
            key={sport.id}
            icon={sport.icon}
            title={sport.name}
            selected={formData.sport === sport.id}
            onClick={() => handleSportSelect(sport.id)}
            className="transition-transform duration-150 hover:scale-[1.02]"
          />
        ))}
      </div>
    </div>
  );
}