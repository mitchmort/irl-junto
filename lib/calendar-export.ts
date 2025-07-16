import { Event } from '@/types/database';

interface CalendarEventData {
  event: Event;
  organizerName?: string;
  organizerEmail?: string;
  participantCount?: number;
}

/**
 * Escapes special characters for iCalendar format
 */
function escapeICalValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Formats a date to iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(dateStr: string, timeStr: string): string {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  date.setHours(hours, minutes, 0, 0);
  
  // Convert to UTC and format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}T${hour}${minute}00Z`;
}

/**
 * Parses location JSON and returns formatted address
 */
function parseLocation(locationStr: string): { name?: string; address: string; } {
  try {
    const location = JSON.parse(locationStr);
    return {
      name: location.name,
      address: location.address || locationStr
    };
  } catch {
    return { address: locationStr };
  }
}

/**
 * Calculates end time based on start time and duration
 */
function calculateEndTime(dateStr: string, timeStr: string, duration?: string | null): string {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  
  // Default to 2 hours if no duration specified
  let durationMinutes = 120;
  
  if (duration) {
    // Parse duration like "2 hours", "90 minutes", "1.5 hours"
    const match = duration.match(/(\d+(?:\.\d+)?)\s*(hour|minute|hr|min)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('hour') || unit === 'hr') {
        durationMinutes = value * 60;
      } else {
        durationMinutes = value;
      }
    }
  }
  
  date.setMinutes(date.getMinutes() + durationMinutes);
  
  return formatICalDate(date.toISOString().split('T')[0], `${date.getHours()}:${date.getMinutes()}`);
}

/**
 * Generates an iCalendar (.ics) file content for an event
 */
export function generateICalendar(data: CalendarEventData): string {
  const { event, organizerName, organizerEmail, participantCount } = data;
  
  const location = parseLocation(event.location);
  const startDate = formatICalDate(event.date, event.time);
  const endDate = calculateEndTime(event.date, event.time, event.duration);
  const timestamp = formatICalDate(new Date().toISOString().split('T')[0], new Date().toTimeString().substr(0, 5));
  
  // Build description
  let description = event.description || `${event.sport} game organized on Junto`;
  
  if (participantCount !== undefined) {
    description += `\\n\\nParticipants: ${participantCount}/${event.max_participants}`;
  }
  
  if (event.skill_levels) {
    const skillLevels = Array.isArray(event.skill_levels) 
      ? event.skill_levels 
      : typeof event.skill_levels === 'string' 
        ? [event.skill_levels]
        : [];
    if (skillLevels.length > 0) {
      description += `\\nSkill Level: ${skillLevels.join(', ')}`;
    }
  }
  
  if (event.equipment_requirements) {
    description += `\\nEquipment: ${event.equipment_requirements}`;
  }
  
  if (event.cost) {
    description += `\\nCost: $${event.cost}`;
  }
  
  if (event.arrival_instructions) {
    description += `\\n\\nArrival Instructions: ${event.arrival_instructions}`;
  }
  
  // Build location string
  let locationStr = location.address;
  if (location.name) {
    locationStr = `${location.name}, ${location.address}`;
  }
  
  // Build organizer string
  let organizerStr = '';
  if (organizerName || organizerEmail) {
    organizerStr = `ORGANIZER;CN=${organizerName || 'Event Organizer'}:mailto:${organizerEmail || 'noreply@junto.app'}\r\n`;
  }
  
  const icsContent = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Junto//Sports Events//EN\r
CALSCALE:GREGORIAN\r
METHOD:PUBLISH\r
BEGIN:VEVENT\r
UID:${event.id}@junto.app\r
DTSTAMP:${timestamp}\r
DTSTART:${startDate}\r
DTEND:${endDate}\r
SUMMARY:${escapeICalValue(event.title)} - ${escapeICalValue(event.sport)}\r
DESCRIPTION:${escapeICalValue(description)}\r
LOCATION:${escapeICalValue(locationStr)}\r
URL:${process.env.NEXT_PUBLIC_APP_URL || 'https://junto.app'}/events/${event.url_slug || event.id}\r
${organizerStr}STATUS:CONFIRMED\r
SEQUENCE:0\r
END:VEVENT\r
END:VCALENDAR`;

  return icsContent;
}

/**
 * Downloads an .ics file to the user's device
 */
export function downloadICalendar(data: CalendarEventData, filename?: string) {
  const icsContent = generateICalendar(data);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${data.event.url_slug || data.event.id}-event.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates calendar-specific URLs for adding events
 */
export function generateCalendarUrls(data: CalendarEventData) {
  const { event } = data;
  const location = parseLocation(event.location);
  
  // Parse dates
  const startDate = new Date(event.date);
  const [hours, minutes] = event.time.split(':').map(Number);
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate);
  if (event.duration) {
    const match = event.duration.match(/(\d+(?:\.\d+)?)\s*(hour|minute|hr|min)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('hour') || unit === 'hr') {
        endDate.setMinutes(endDate.getMinutes() + value * 60);
      } else {
        endDate.setMinutes(endDate.getMinutes() + value);
      }
    }
  } else {
    endDate.setHours(endDate.getHours() + 2); // Default 2 hours
  }
  
  // Format dates for Google Calendar
  const googleStartDate = startDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const googleEndDate = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  // Build details
  let details = event.description || `${event.sport} game organized on Junto`;
  if (event.arrival_instructions) {
    details += `\n\nArrival Instructions: ${event.arrival_instructions}`;
  }
  details += `\n\nView event: ${process.env.NEXT_PUBLIC_APP_URL || 'https://junto.app'}/events/${event.url_slug || event.id}`;
  
  const locationStr = location.name 
    ? `${location.name}, ${location.address}`
    : location.address;
  
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title + ' - ' + event.sport)}&dates=${googleStartDate}/${googleEndDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(locationStr)}`,
    
    // Webcal URL for subscription (to be implemented with the API)
    webcal: `webcal://${process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'junto.app'}/api/events/${event.id}/calendar.ics`,
    
    // Direct download
    download: `/api/events/${event.id}/calendar.ics`
  };
}