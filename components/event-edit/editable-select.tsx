"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEventEditStore } from "@/store/event-edit";
import { Edit3, Save, X } from "lucide-react";

interface EditableSelectProps {
  fieldName: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  displayValue?: string;
  onValidate?: (value: string) => string | null;
}

export function EditableSelect({
  fieldName,
  value,
  options,
  placeholder,
  className = "",
  displayValue,
  onValidate
}: EditableSelectProps) {
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

  const getCurrentDisplayValue = () => {
    const option = options.find(opt => opt.value === currentValue);
    return option ? option.label : currentValue;
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Select value={localValue} onValueChange={setLocalValue}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <span>{displayValue || getCurrentDisplayValue()}</span>
        <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}