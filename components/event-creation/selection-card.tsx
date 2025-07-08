"use client";

import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function SelectionCard({
  icon,
  title,
  subtitle,
  selected = false,
  onClick,
  className,
  disabled = false
}: SelectionCardProps) {
  return (
    <Card
      className={cn(
        "p-4 h-20 cursor-pointer transition-all duration-200 touch-manipulation",
        "hover:border-primary hover:shadow-md active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected && "ring-2 ring-primary border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center gap-4 h-full">
        {icon && (
          <div className="text-2xl flex-shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
        
        {selected && (
          <Check 
            className="w-5 h-5 text-primary flex-shrink-0" 
            aria-hidden="true"
          />
        )}
      </div>
    </Card>
  );
}