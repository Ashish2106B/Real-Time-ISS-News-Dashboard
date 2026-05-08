export interface Coordinates {
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface.
 * Returns distance in kilometers.
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates speed in km/h between two coordinates
 */
export function calculateSpeed(coord1: Coordinates, coord2: Coordinates): number {
  const distance = calculateHaversineDistance(coord1, coord2);
  const timeSeconds = Math.abs(coord2.timestamp - coord1.timestamp);
  
  if (timeSeconds === 0) return 0;
  
  // Convert time to hours
  const timeHours = timeSeconds / 3600;
  return distance / timeHours;
}
