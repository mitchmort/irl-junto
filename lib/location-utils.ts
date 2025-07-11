/**
 * Utility function to parse location data that might be stored as JSON or plain text
 * @param locationField - The location field from the database
 * @returns A human-readable location string
 */
export function parseLocationData(locationField: string): string {
  try {
    // Try to parse as JSON first
    const locationData = JSON.parse(locationField);
    
    // If it's a structured location object, extract the readable parts
    if (locationData && typeof locationData === 'object') {
      // Priority: name > address > fallback to original string
      return locationData.name || locationData.address || locationField;
    }
    
    // If JSON parsing worked but it's not an object, return as-is
    return locationField;
  } catch (error) {
    // If JSON parsing fails, return the original string
    return locationField;
  }
}

/**
 * Get detailed location information from location field
 * @param locationField - The location field from the database
 * @returns Object with parsed location details
 */
export function getLocationDetails(locationField: string): {
  name?: string;
  address?: string;
  displayText: string;
  coordinates?: { lat: number; lng: number };
} {
  try {
    const locationData = JSON.parse(locationField);
    
    if (locationData && typeof locationData === 'object') {
      return {
        name: locationData.name,
        address: locationData.address,
        displayText: locationData.name || locationData.address || locationField,
        coordinates: locationData.coordinates
      };
    }
    
    return { displayText: locationField };
  } catch (error) {
    return { displayText: locationField };
  }
}