"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEventEditStore } from "@/store/event-edit";
import { Edit3, Save, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface EditableDateProps {
  fieldName: string;
  value: string;
  className?: string;
  displayFormat?: string;
  onValidate?: (value: string) => string | null;
}

export function EditableDate({
  fieldName,
  value,
  className = "",
  displayFormat = "EEEE, MMMM d, yyyy",
  onValidate
}: EditableDateProps) {
  const { 
    editingField, 
    setEditingField, 
    getFieldValue, 
    updateField, 
    setError, 
    clearError,
    errors
  } = useEventEditStore();

  const [localValue, setLocalValue] = useState<Date | undefined>(new Date(value));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isEditing = editingField === fieldName;
  const currentValue = getFieldValue(fieldName);
  const error = errors[fieldName];

  // Update local value when field value changes
  useEffect(() => {
    const fieldValue = getFieldValue(fieldName);
    setLocalValue(fieldValue ? new Date(fieldValue) : undefined);
  }, [getFieldValue, fieldName]);

  const handleEdit = () => {
    setEditingField(fieldName);
    const fieldValue = getFieldValue(fieldName);
    setLocalValue(fieldValue ? new Date(fieldValue) : undefined);
  };

  const handleSave = () => {
    if (!localValue) {
      setError(fieldName, "Date is required");
      return;
    }

    const dateString = localValue.toISOString().split('T')[0];
    
    // Validate if validation function provided
    if (onValidate) {
      const validationError = onValidate(dateString);
      if (validationError) {
        setError(fieldName, validationError);
        return;
      }
    }

    // Clear any existing error
    clearError(fieldName);
    
    // Update the field value
    updateField(fieldName, dateString);
    setEditingField(null);
    setIsCalendarOpen(false);
  };

  const handleCancel = () => {
    const fieldValue = getFieldValue(fieldName);
    setLocalValue(fieldValue ? new Date(fieldValue) : undefined);
    setEditingField(null);
    setIsCalendarOpen(false);
    clearError(fieldName);
  };

  const getDisplayValue = () => {
    const fieldValue = getFieldValue(fieldName);
    if (!fieldValue) return "No date selected";
    
    try {
      return format(new Date(fieldValue), displayFormat);
    } catch {
      return fieldValue;
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${className}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localValue ? format(localValue, displayFormat) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localValue}
                onSelect={setLocalValue}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`group cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 ${className}`} onClick={handleEdit}>
      <div className="flex items-center gap-2">
        <span>{getDisplayValue()}</span>
        <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}