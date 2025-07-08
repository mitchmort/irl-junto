"use client";

import { useState } from "react";
import { useEventCreationStore } from "@/store/event-creation";
import { SelectionCard } from "@/components/event-creation/selection-card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { addDays, format, isToday, isTomorrow, isThisWeek, isSaturday } from "date-fns";

export function DateSelectionStep() {
  const { formData, updateField, nextStep } = useEventCreationStore();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  // Find next Saturday
  const getNextSaturday = () => {
    const date = new Date(today);
    const daysUntilSaturday = (6 - date.getDay()) % 7;
    return addDays(date, daysUntilSaturday === 0 ? 7 : daysUntilSaturday);
  };
  
  const nextSaturday = getNextSaturday();

  const quickDates = [
    {
      id: 'today',
      date: today,
      title: '📅 Today',
      subtitle: format(today, 'EEEE, MMM d')
    },
    {
      id: 'tomorrow',
      date: tomorrow,
      title: '📅 Tomorrow',
      subtitle: format(tomorrow, 'EEEE, MMM d')
    },
    {
      id: 'saturday',
      date: nextSaturday,
      title: '📅 This Weekend',
      subtitle: format(nextSaturday, 'EEEE, MMM d')
    }
  ];

  const handleQuickDateSelect = (date: Date) => {
    updateField('date', date);
    
    // Auto-advance
    setTimeout(() => {
      nextStep();
    }, 150);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      updateField('date', date);
      setIsCalendarOpen(false);
      
      // Auto-advance
      setTimeout(() => {
        nextStep();
      }, 150);
    }
  };

  const isDateSelected = (date: Date): boolean => {
    return !!(formData.date && 
           format(formData.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          When is your event?
        </h1>
        <p className="text-muted-foreground">
          Pick a date for your game
        </p>
      </div>

      <div className="space-y-3">
        {quickDates.map((quickDate) => (
          <SelectionCard
            key={quickDate.id}
            title={quickDate.title}
            subtitle={quickDate.subtitle}
            selected={isDateSelected(quickDate.date)}
            onClick={() => handleQuickDateSelect(quickDate.date)}
            className="transition-transform duration-150 hover:scale-[1.02]"
          />
        ))}

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Card className="p-4 h-20 cursor-pointer hover:border-primary hover:shadow-md active:scale-[0.98] transition-all duration-200">
              <div className="flex items-center gap-4 h-full">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <h3 className="font-medium text-base">Pick a date</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose any day
                  </p>
                </div>
              </div>
            </Card>
          </PopoverTrigger>
          
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={formData.date || undefined}
              onSelect={handleCalendarSelect}
              disabled={(date) => 
                date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || 
                date > addDays(today, 30)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}