"use client";

import { useEventCreationStore, skillLevels } from "@/store/event-creation";
import { SelectionCard } from "@/components/event-creation/selection-card";

export function SkillLevelStep() {
  const { formData, updateField, nextStep } = useEventCreationStore();

  const handleSkillLevelSelect = (skillLevelId: string) => {
    updateField('skillLevel', skillLevelId);
    
    // Auto-advance
    setTimeout(() => {
      nextStep();
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Skill level required?
        </h1>
        <p className="text-muted-foreground">
          Set expectations for participants
        </p>
      </div>

      <div className="space-y-3">
        {skillLevels.map((skillLevel) => (
          <SelectionCard
            key={skillLevel.id}
            title={skillLevel.name}
            subtitle={skillLevel.description}
            selected={formData.skillLevel === skillLevel.id}
            onClick={() => handleSkillLevelSelect(skillLevel.id)}
            className="transition-transform duration-150 hover:scale-[1.02]"
          />
        ))}
      </div>
    </div>
  );
}