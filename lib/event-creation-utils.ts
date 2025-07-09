import { EventCreationFormData } from '@/store/event-creation';
import { EventInsert } from '@/types/database';
import { format } from 'date-fns';

/**
 * Generates an enhanced event title in the format "Day Period Activity Subcategory"
 * Example: "Tuesday Morning Tennis Doubles"
 */
export function generateEnhancedEventTitle(formData: EventCreationFormData): string {
  if (!formData.date || !formData.startTime || !formData.sport) {
    return 'Event'; // Fallback for incomplete data
  }

  // Get day name
  const dayName = format(formData.date, 'EEEE');
  
  // Get time period based on start time
  const [hours] = formData.startTime.split(':');
  const hour = parseInt(hours);
  let timePeriod = '';
  
  if (hour >= 5 && hour < 12) {
    timePeriod = 'Morning';
  } else if (hour >= 12 && hour < 17) {
    timePeriod = 'Afternoon';
  } else {
    timePeriod = 'Evening';
  }
  
  // Get activity (capitalize first letter)
  const activity = formData.sport.charAt(0).toUpperCase() + formData.sport.slice(1);
  
  // Get subcategory (format)
  const subcategory = formData.isCustomFormat 
    ? formData.customFormatText || 'Game'
    : formData.format;
  
  return `${dayName} ${timePeriod} ${activity} ${subcategory}`;
}

/**
 * Transforms form data from the event creation flow into the format expected by Supabase
 */
export function transformFormDataToSupabase(
  formData: EventCreationFormData,
  organizerId: string
): EventInsert {
  // Generate event title from sport and format (legacy function for backward compatibility)
  const getEventTitle = (): string => {
    const sport = formData.sport.charAt(0).toUpperCase() + formData.sport.slice(1);
    const format = formData.isCustomFormat 
      ? formData.customFormatText || 'Custom Game'
      : formData.format;
    return `${sport} ${format}`;
  };

  // Get the final title - use custom title if set, otherwise generate enhanced title
  const getFinalTitle = (): string => {
    if (formData.isCustomTitle && formData.title) {
      return formData.title;
    }
    return generateEnhancedEventTitle(formData);
  };

  // Convert duration from minutes to a string format
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  // Format date to YYYY-MM-DD string
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Convert location object to JSON string
  const formatLocation = (): string => {
    if (!formData.location) return '';
    
    // Store as JSON string to preserve all location data
    return JSON.stringify({
      placeId: formData.location.placeId,
      name: formData.location.name,
      address: formData.location.address,
      coordinates: formData.location.coordinates
    });
  };

  // Parse additional details into equipment and arrival instructions
  const parseAdditionalDetails = (): { equipment: string; arrival: string } => {
    if (!formData.additionalDetails) {
      return { equipment: '', arrival: '' };
    }

    const details = formData.additionalDetails.trim();
    
    // Simple parsing - look for common keywords to separate
    const equipmentKeywords = ['bring', 'equipment', 'gear', 'ball', 'racket', 'shoes'];
    const arrivalKeywords = ['meet', 'entrance', 'parking', 'arrive', 'location', 'entrance'];
    
    const lines = details.split('\n').map(line => line.trim()).filter(Boolean);
    
    let equipment = '';
    let arrival = '';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      const hasEquipmentKeyword = equipmentKeywords.some(keyword => lowerLine.includes(keyword));
      const hasArrivalKeyword = arrivalKeywords.some(keyword => lowerLine.includes(keyword));
      
      if (hasEquipmentKeyword && !hasArrivalKeyword) {
        equipment = equipment ? `${equipment}\n${line}` : line;
      } else if (hasArrivalKeyword && !hasEquipmentKeyword) {
        arrival = arrival ? `${arrival}\n${line}` : line;
      } else {
        // If unclear or has both keywords, add to equipment by default
        equipment = equipment ? `${equipment}\n${line}` : line;
      }
    });
    
    // If no clear separation was found, put everything in equipment
    if (!equipment && !arrival && details) {
      equipment = details;
    }
    
    return { equipment, arrival };
  };

  const { equipment, arrival } = parseAdditionalDetails();

  // Transform the data
  const eventData: EventInsert = {
    title: getFinalTitle(),
    sport: formData.sport,
    sub_type: formData.isCustomFormat ? formData.customFormatText || null : formData.format,
    skill_levels: JSON.stringify([formData.skillLevel]), // Store as array in JSON
    date: formatDate(formData.date!),
    time: formData.startTime,
    duration: formatDuration(formData.duration),
    max_participants: formData.totalPlayers,
    participant_count: formData.playersConfirmed,
    location: formatLocation(),
    cost: formData.cost || 0,
    equipment_requirements: equipment || null,
    arrival_instructions: arrival || null,
    organizer: organizerId,
    status: 'open',
    description: null, // Could be added to form later
    notes: null,
    image: null,
    share_link: null // Will be generated after creation
  };

  return eventData;
}

/**
 * Generates a shareable link for an event
 */
export function generateShareLink(eventId: number, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://junto.app');
  return `${base}/event/${eventId}`;
}

/**
 * Validates form data before submission
 */
export function validateEventFormData(formData: EventCreationFormData): string[] {
  const errors: string[] = [];

  if (!formData.sport) errors.push('Sport is required');
  if (!formData.format && !formData.isCustomFormat) errors.push('Event format is required');
  if (formData.isCustomFormat && !formData.customFormatText?.trim()) errors.push('Custom format description is required');
  if (!formData.skillLevel) errors.push('Skill level is required');
  if (!formData.date) errors.push('Event date is required');
  if (!formData.startTime) errors.push('Start time is required');
  if (formData.duration <= 0) errors.push('Duration must be greater than 0');
  if (formData.totalPlayers < 2) errors.push('Event must allow at least 2 players');
  if (formData.playersConfirmed < 1) errors.push('At least one player must be confirmed');
  if (formData.totalPlayers < formData.playersConfirmed) errors.push('Confirmed players cannot exceed total players');
  if (!formData.location) errors.push('Location is required');
  if (formData.cost < 0) errors.push('Cost cannot be negative');

  return errors;
}