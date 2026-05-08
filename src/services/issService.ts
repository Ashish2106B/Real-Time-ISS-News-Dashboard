export interface ISSPositionResponse {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

export class ISSService {
  private static readonly API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
  
  static async fetchPosition(retries = 3, backoff = 1000): Promise<any> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Adapt to the expected structure in useISSData.ts
      // We'll return an object that matches what useISSData expect: { iss_position: { latitude, longitude }, timestamp }
      return {
        message: 'success',
        timestamp: data.timestamp,
        iss_position: {
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString()
        }
      };
    } catch (error) {
      if (retries > 0) {
        console.warn(`ISS fetch failed, retrying in ${backoff}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchPosition(retries - 1, backoff * 2);
      }
      throw error;
    }
  }
}
