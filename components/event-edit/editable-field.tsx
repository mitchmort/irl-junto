"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEventEditStore } from "@/store/event-edit";
import { Edit3, Save, X } from "lucide-react";

interface EditableFieldProps {
  fieldName: string;
  value: string | number;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  className?: string;
  displayValue?: string;
  onValidate?: (value: string | number) => string | null;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function EditableField({
  fieldName,
  value,
  type = "text",
  placeholder,
  className = "",
  displayValue,
  onValidate,
  maxLength,
  min,
  max
}: EditableFieldProps) {
  const { 
    editingField, 
    setEditingField, 
    getFieldValue, 
    updateField, 
    setError, 
    clearError,
    errors
  } = useEventEditStore();

  const [localValue, setLocalValue] = useState(value ?? '');
  const isEditing = editingField === fieldName;
  const currentValue = getFieldValue(fieldName);
  const error = errors[fieldName];

  // Update local value when field value changes
  useEffect(() => {
    const fieldValue = getFieldValue(fieldName);
    setLocalValue(fieldValue ?? '');
  }, [getFieldValue, fieldName]);

  const handleEdit = () => {
    setEditingField(fieldName);
    setLocalValue(currentValue ?? '');
  };

  const handleSave = () => {
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
    setLocalValue(currentValue ?? '');
    setEditingField(null);
    clearError(fieldName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
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
          {type === "textarea" ? (
            <Textarea
              value={localValue ?? ''}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={className}
              maxLength={maxLength}
              autoFocus
            />
          ) : (
            <Input
              type={type}
              value={localValue ?? ''}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={className}
              maxLength={maxLength}
              min={min}
              max={max}
              autoFocus
            />
          )}
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
        {type === "textarea" && maxLength && (
          <p className="text-xs text-muted-foreground">
            {String(localValue ?? '').length}/{maxLength} characters
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`group cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 ${className}`} onClick={handleEdit}>
      <div className="flex items-center gap-2">
        <span>{displayValue || currentValue}</span>
        <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}