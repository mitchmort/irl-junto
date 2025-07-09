import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EventLocation {
  placeId: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventCreationFormData {
  // Step 1: Sport Selection
  sport: string;
  
  // Step 2: Format Selection
  format: string;
  isCustomFormat: boolean;
  customFormatText?: string;
  
  // Step 3: Skill Level
  skillLevel: string;
  
  // Step 4: Date
  date: Date | null;
  
  // Step 5: Time & Duration
  startTime: string;
  duration: number; // in minutes
  
  // Step 6: Player Count
  totalPlayers: number;
  playersConfirmed: number;
  
  // Step 7: Location
  location: EventLocation | null;
  
  // Step 8: Cost & Details
  cost: number; // 0 for free
  additionalDetails?: string;
  
  // Auto-generated/Custom Title
  title?: string; // Auto-generated or custom title
  isCustomTitle: boolean; // Whether user has manually edited the title
}

interface EventCreationStore {
  // Form data
  formData: EventCreationFormData;
  
  // Navigation state
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  
  // Loading states
  isSubmitting: boolean;
  isValidatingStep: boolean;
  
  // Success state
  createdEventId: string | null;
  createdEventSlug: string | null;
  showSuccessScreen: boolean;
  
  // Actions
  updateField: <K extends keyof EventCreationFormData>(
    field: K, 
    value: EventCreationFormData[K]
  ) => void;
  
  updateFormData: (data: Partial<EventCreationFormData>) => void;
  
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  canAdvanceToStep: (step: number) => boolean;
  
  setSubmitting: (isSubmitting: boolean) => void;
  setValidating: (isValidating: boolean) => void;
  setCreatedEventId: (eventId: string | null) => void;
  setCreatedEventSlug: (eventSlug: string | null) => void;
  setShowSuccessScreen: (show: boolean) => void;
  
  resetForm: () => void;
  
  // Validation helpers
  validateCurrentStep: () => boolean;
  getStepValidationErrors: () => string[];
}

const initialFormData: EventCreationFormData = {
  sport: '',
  format: '',
  isCustomFormat: false,
  customFormatText: '',
  skillLevel: '',
  date: null,
  startTime: '',
  duration: 90, // Default 90 minutes
  totalPlayers: 10, // Default for basketball
  playersConfirmed: 1, // Including organizer
  location: null,
  cost: 0, // Free by default
  additionalDetails: '',
  title: undefined, // Will be auto-generated
  isCustomTitle: false // Starts as auto-generated
};

export const useEventCreationStore = create<EventCreationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      formData: initialFormData,
      currentStep: 1,
      totalSteps: 9,
      completedSteps: new Set<number>(),
      isSubmitting: false,
      isValidatingStep: false,
      createdEventId: null,
      createdEventSlug: null,
      showSuccessScreen: false,

      // Form data actions
      updateField: (field, value) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [field]: value
          }
        }));
      },

      updateFormData: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            ...data
          }
        }));
      },

      // Navigation actions
      setCurrentStep: (step) => {
        set({ currentStep: Math.min(Math.max(1, step), get().totalSteps) });
      },

      nextStep: () => {
        const { currentStep, totalSteps, validateCurrentStep, markStepCompleted } = get();
        
        if (validateCurrentStep() && currentStep < totalSteps) {
          markStepCompleted(currentStep);
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      markStepCompleted: (step) => {
        set((state) => ({
          completedSteps: new Set(state.completedSteps).add(step)
        }));
      },

      isStepCompleted: (step) => {
        return get().completedSteps.has(step);
      },

      canAdvanceToStep: (step) => {
        const { currentStep, completedSteps } = get();
        // Can advance to next step or any completed step
        return step <= currentStep + 1 || completedSteps.has(step);
      },

      // Loading states
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setValidating: (isValidating) => set({ isValidatingStep: isValidating }),
      setCreatedEventId: (eventId) => set({ createdEventId: eventId }),
      setCreatedEventSlug: (eventSlug) => set({ createdEventSlug: eventSlug }),
      setShowSuccessScreen: (show) => set({ showSuccessScreen: show }),

      // Validation
      validateCurrentStep: () => {
        const { currentStep, formData } = get();
        
        switch (currentStep) {
          case 1: // Sport Selection
            return !!formData.sport;
            
          case 2: // Format Selection
            if (formData.isCustomFormat) {
              return !!formData.customFormatText?.trim();
            }
            return !!formData.format;
            
          case 3: // Skill Level
            return !!formData.skillLevel;
            
          case 4: // Date
            return !!formData.date;
            
          case 5: // Time & Duration
            return !!formData.startTime && formData.duration > 0;
            
          case 6: // Player Count
            return formData.totalPlayers >= formData.playersConfirmed && 
                   formData.playersConfirmed >= 1;
            
          case 7: // Location
            return !!formData.location;
            
          case 8: // Cost
            return formData.cost >= 0;
            
          case 9: // Additional Details (optional)
            return true; // This step is always valid since it's optional
            
          default:
            return false;
        }
      },

      getStepValidationErrors: () => {
        const { currentStep, formData } = get();
        const errors: string[] = [];
        
        switch (currentStep) {
          case 1:
            if (!formData.sport) errors.push('Please select a sport');
            break;
            
          case 2:
            if (formData.isCustomFormat && !formData.customFormatText?.trim()) {
              errors.push('Please enter a custom format or select a preset');
            } else if (!formData.isCustomFormat && !formData.format) {
              errors.push('Please select an event format');
            }
            break;
            
          case 3:
            if (!formData.skillLevel) errors.push('Please select a skill level');
            break;
            
          case 4:
            if (!formData.date) errors.push('Please select an event date');
            break;
            
          case 5:
            if (!formData.startTime) errors.push('Please select a start time');
            if (formData.duration <= 0) errors.push('Please select event duration');
            break;
            
          case 6:
            if (formData.totalPlayers < formData.playersConfirmed) {
              errors.push('Total players cannot be less than confirmed players');
            }
            if (formData.playersConfirmed < 1) {
              errors.push('You must have at least 1 confirmed player (yourself)');
            }
            break;
            
          case 7:
            if (!formData.location) errors.push('Please select a location');
            break;
            
          case 8:
            if (formData.cost < 0) errors.push('Cost cannot be negative');
            break;
        }
        
        return errors;
      },

      // Reset
      resetForm: () => {
        set({
          formData: initialFormData,
          currentStep: 1,
          completedSteps: new Set<number>(),
          isSubmitting: false,
          isValidatingStep: false,
          createdEventId: null,
          createdEventSlug: null,
          showSuccessScreen: false
        });
      }
    }),
    {
      name: 'event-creation-store',
      // Only persist form data, not navigation/loading states
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps) // Convert Set to Array for persistence
      }),
      // Convert back to Set on rehydration
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.completedSteps)) {
          state.completedSteps = new Set(state.completedSteps);
        }
      }
    }
  )
);

// Sport-specific defaults
export const sportDefaults = {
  basketball: {
    formats: [
      { id: '5v5', name: '5v5 Full Court', players: 10, description: '10 players total' },
      { id: '3v3', name: '3v3 Half Court', players: 6, description: '6 players total' },
      { id: 'pickup', name: 'Open Pickup', players: null, description: 'Flexible teams' }
    ],
    defaultPlayers: 10,
    defaultDuration: 90,
    popularTimes: ['6:00 PM', '7:00 PM', '8:00 PM']
  },
  tennis: {
    formats: [
      { id: 'singles', name: 'Singles', players: 2, description: '1v1 match' },
      { id: 'doubles', name: 'Doubles', players: 4, description: '2v2 match' },
      { id: 'mixed', name: 'Mixed Doubles', players: 4, description: 'Mixed 2v2' }
    ],
    defaultPlayers: 4,
    defaultDuration: 60,
    popularTimes: ['9:00 AM', '10:00 AM', '6:00 PM']
  },
  pickleball: {
    formats: [
      { id: 'singles', name: 'Singles', players: 2, description: '1v1 match' },
      { id: 'doubles', name: 'Doubles', players: 4, description: '2v2 match' },
      { id: 'round-robin', name: 'Round Robin', players: 8, description: 'Tournament style' }
    ],
    defaultPlayers: 4,
    defaultDuration: 60,
    popularTimes: ['10:00 AM', '2:00 PM', '6:00 PM']
  },
  volleyball: {
    formats: [
      { id: '6v6', name: '6v6 Indoor', players: 12, description: '12 players total' },
      { id: '4v4', name: '4v4 Beach', players: 8, description: '8 players total' },
      { id: 'tournament', name: 'Tournament', players: 16, description: 'Multiple teams' }
    ],
    defaultPlayers: 12,
    defaultDuration: 120,
    popularTimes: ['5:00 PM', '6:00 PM', '7:00 PM']
  },
  soccer: {
    formats: [
      { id: '11v11', name: '11v11 Full Field', players: 22, description: '22 players total' },
      { id: '7v7', name: '7v7 Small Sided', players: 14, description: '14 players total' },
      { id: 'pickup', name: 'Pickup Game', players: null, description: 'Flexible teams' }
    ],
    defaultPlayers: 14,
    defaultDuration: 90,
    popularTimes: ['10:00 AM', '2:00 PM', '6:00 PM']
  },
  climbing: {
    formats: [
      { id: 'bouldering', name: 'Bouldering', players: 6, description: 'Indoor climbing' },
      { id: 'top-rope', name: 'Top Rope', players: 4, description: 'Partner climbing' },
      { id: 'outdoor', name: 'Outdoor Climbing', players: 8, description: 'Rock climbing' }
    ],
    defaultPlayers: 6,
    defaultDuration: 120,
    popularTimes: ['10:00 AM', '2:00 PM', '7:00 PM']
  }
};

// Skill levels
export const skillLevels = [
  { id: 'beginner', name: 'Beginner', description: 'Just starting out' },
  { id: 'casual', name: 'Casual', description: 'Play for fun' },
  { id: 'intermediate', name: 'Intermediate', description: 'Regular player' },
  { id: 'advanced', name: 'Advanced', description: 'Competitive level' },
  { id: 'all', name: 'All Welcome', description: 'Any skill level' }
];