"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventEditStore } from "@/store/event-edit";
import { Edit3, Save, X } from "lucide-react";

interface EditableTimeProps {
  fieldName: string;
  value: string;
  className?: string;
  onValidate?: (value: string) => string | null;
}

export function EditableTime({
  fieldName,
  value,
  className = "",
  onValidate
}: EditableTimeProps) {
  const { 
    editingField, 
    setEditingField, 
    getFieldValue, 
    updateField, 
    setError, 
    clearError,
    errors
  } = useEventEditStore();

  const [localValue, setLocalValue] = useState(value);
  const isEditing = editingField === fieldName;
  const currentValue = getFieldValue(fieldName);
  const error = errors[fieldName];

  // Update local value when field value changes
  useEffect(() => {
    setLocalValue(getFieldValue(fieldName));
  }, [getFieldValue, fieldName]);

  const handleEdit = () => {
    setEditingField(fieldName);
    setLocalValue(currentValue);
  };

  const handleSave = () => {
    // Validate time format
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(localValue)) {
      setError(fieldName, "Invalid time format. Use HH:MM format.");
      return;
    }

    // Validate if validation function provided
    if (onValidate) {
      const validationError = onValidate(localValue);
      if (validationError) {
        setError(fieldName, validationError);
        return;
      }
    }

    // Clear any existing error
    clearError(fieldName);
    
    // Update the field value
    updateField(fieldName, localValue);
    setEditingField(null);
  };

  const handleCancel = () => {
    setLocalValue(currentValue);
    setEditingField(null);
    clearError(fieldName);
  };

  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={className}
            autoFocus
          />
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
        <span>{formatTimeDisplay(currentValue)}</span>
        <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}