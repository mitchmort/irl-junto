'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  autoFocus?: boolean;
}

export function VerificationCodeInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  className,
  label,
  error,
  autoFocus = false,
}: VerificationCodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').slice(0, length);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/[^\d]/g, '');
    
    if (digit.length > 1) {
      // Handle pasted content
      const pastedDigits = digit.slice(0, length);
      const newValue = pastedDigits.padEnd(length, '').slice(0, length);
      onChange(newValue.replace(/\s/g, ''));
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = pastedDigits.length < length ? pastedDigits.length : length - 1;
      if (inputRefs.current[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex].focus();
      }
      return;
    }

    // Update single digit
    const newDigits = [...digits];
    while (newDigits.length < length) {
      newDigits.push('');
    }
    newDigits[index] = digit;
    onChange(newDigits.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => (
          <Input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digits[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onClick={() => handleClick(index)}
            disabled={disabled}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold',
              'border-2 rounded-lg',
              'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
              digits[index] && 'border-green-500',
              focusedIndex === index && 'border-blue-500 ring-2 ring-blue-200'
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
      <p className="text-xs text-muted-foreground text-center">
        Enter the {length}-digit code sent to your phone
      </p>
    </div>
  );
}