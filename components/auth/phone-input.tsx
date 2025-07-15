'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { validatePhoneNumber, formatPhoneNumberForDisplay } from '@/lib/twilio/phone-utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "(555) 123-4567",
  disabled = false,
  required = false,
  className,
  label,
  error,
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [validationError, setValidationError] = useState('');

  // Format phone number as user types
  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  // Validate phone number
  useEffect(() => {
    if (value.trim() === '') {
      setIsValid(false);
      setValidationError('');
      onValidationChange?.(false);
      return;
    }

    const validation = validatePhoneNumber(value);
    setIsValid(validation.isValid);
    setValidationError(validation.error || '');
    onValidationChange?.(validation.isValid);
  }, [value, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digit characters except + and spaces/dashes for formatting
    const cleanValue = inputValue.replace(/[^\d+\s\-\(\)]/g, '');
    
    // Update the raw value
    onChange(cleanValue);
    
    // Update display value with formatting
    if (cleanValue.length > 0) {
      try {
        const formatted = formatPhoneNumberForDisplay(cleanValue);
        setDisplayValue(formatted);
      } catch {
        setDisplayValue(cleanValue);
      }
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    // Format the phone number on blur
    if (value.trim() !== '') {
      try {
        const formatted = formatPhoneNumberForDisplay(value);
        setDisplayValue(formatted);
      } catch {
        // Keep original value if formatting fails
      }
    }
  };

  const errorMessage = error || validationError;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="phone-input" className={cn(required && 'after:content-["*"] after:text-red-500')}>
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id="phone-input"
          type="tel"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={cn(
            errorMessage && 'border-red-500 focus:border-red-500',
            isValid && value.trim() !== '' && 'border-green-500 focus:border-green-500'
          )}
        />
        {isValid && value.trim() !== '' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
      {isValid && value.trim() !== '' && !errorMessage && (
        <p className="text-sm text-green-600">Valid phone number</p>
      )}
    </div>
  );
}