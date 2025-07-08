"use client";

import { useEventCreationStore, sportDefaults } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function TimeSelectionStep() {
  const { formData, updateFormData, nextStep, validateCurrentStep } = useEventCreationStore();

  // Generate time options (30-minute intervals from 6 AM to 10 PM)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let min of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const date = new Date(`2000-01-01T${time}`);
        const label = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: time, label });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Get popular times for the selected sport
  const sportConfig = sportDefaults[formData.sport as keyof typeof sportDefaults];
  const popularTimes = sportConfig?.popularTimes || ['6:00 PM', '7:00 PM', '8:00 PM'];

  // Convert popular times to 24-hour format for comparison
  const convertTo24Hour = (time12: string) => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM' && hours !== '00') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const popularTimesConverted = popularTimes.map(convertTo24Hour);

  // Duration options
  const durationOptions = [
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 150, label: '2.5 hours' },
    { value: 180, label: '3 hours' }
  ];

  // Common duration quick picks
  const commonDurations = [
    { value: 60, label: '1hr' },
    { value: 90, label: '90min' },
    { value: 120, label: '2hr' }
  ];

  const handleTimeSelect = (time: string) => {
    updateFormData({ startTime: time });
  };

  const handleQuickTimeSelect = (timeString: string) => {
    const time24 = convertTo24Hour(timeString);
    updateFormData({ startTime: time24 });
  };

  const handleDurationSelect = (duration: string) => {
    updateFormData({ duration: parseInt(duration, 10) });
  };

  const handleQuickDurationSelect = (duration: number) => {
    updateFormData({ duration });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const canProceed = formData.startTime && formData.duration > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          When does it start?
        </h1>
        <p className="text-muted-foreground">
          Set your start time and duration
        </p>
      </div>

      <div className="space-y-6">
        {/* Start Time Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Start Time</Label>
          
          <Select value={formData.startTime} onValueChange={handleTimeSelect}>
            <SelectTrigger className="h-14 text-lg">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick time picks */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Quick select:</Label>
            <div className="flex gap-2">
              {popularTimes.map((time) => (
                <Button
                  key={time}
                  variant={formData.startTime === convertTo24Hour(time) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickTimeSelect(time)}
                  className="flex-1"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Duration Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Duration</Label>
          
          <Select value={formData.duration.toString()} onValueChange={handleDurationSelect}>
            <SelectTrigger className="h-14 text-lg">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick duration picks */}
          <div className="flex gap-2">
            {commonDurations.map((duration) => (
              <Button
                key={duration.value}
                variant={formData.duration === duration.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickDurationSelect(duration.value)}
                className="flex-1"
              >
                {duration.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        className="w-full h-14 text-lg" 
        disabled={!canProceed}
        onClick={handleNext}
      >
        Next →
      </Button>
    </div>
  );
}