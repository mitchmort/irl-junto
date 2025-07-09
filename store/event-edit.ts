import { create } from 'zustand';
import { Event, EventUpdate } from '@/lib/supabase';

interface EventEditState {
  // Original event data
  originalEvent: Event | null;
  
  // Edit form data
  editData: Partial<EventUpdate>;
  
  // UI state
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  
  // Field-level editing state
  editingField: string | null;
  
  // Validation
  errors: Record<string, string>;
  
  // Actions
  setOriginalEvent: (event: Event) => void;
  updateField: (field: string, value: any) => void;
  setEditingField: (field: string | null) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  resetForm: () => void;
  setIsSaving: (saving: boolean) => void;
  getFieldValue: (field: string) => any;
  hasChanges: () => boolean;
}

export const useEventEditStore = create<EventEditState>((set, get) => ({
  originalEvent: null,
  editData: {},
  isEditing: false,
  isSaving: false,
  isDirty: false,
  editingField: null,
  errors: {},

  setOriginalEvent: (event) => {
    set({
      originalEvent: event,
      editData: {},
      isDirty: false,
      editingField: null,
      errors: {}
    });
  },

  updateField: (field, value) => {
    const { originalEvent, editData } = get();
    
    // Check if the value is different from original
    const originalValue = originalEvent?.[field as keyof Event];
    const isDifferent = value !== originalValue;
    
    set((state) => {
      const newEditData = { ...state.editData };
      
      if (isDifferent) {
        newEditData[field] = value;
      } else {
        delete newEditData[field];
      }
      
      return {
        editData: newEditData,
        isDirty: Object.keys(newEditData).length > 0
      };
    });
  },

  setEditingField: (field) => set({ editingField: field }),

  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error }
    }));
  },

  clearError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  clearAllErrors: () => set({ errors: {} }),

  resetForm: () => {
    set({
      editData: {},
      isDirty: false,
      editingField: null,
      errors: {}
    });
  },

  setIsSaving: (saving) => set({ isSaving: saving }),

  getFieldValue: (field) => {
    const { originalEvent, editData } = get();
    return editData[field] !== undefined ? editData[field] : originalEvent?.[field as keyof Event];
  },

  hasChanges: () => {
    const { isDirty } = get();
    return isDirty;
  }
}));