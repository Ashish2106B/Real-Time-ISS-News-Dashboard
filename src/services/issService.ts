export interface ISSPositionResponse {
  message: string;
  timestamp: number;
  iss_position: {
    latitude: string;
    longitude: string;
  }
}

export class ISSService {
  private static readonly API_URL = 'http://api.open-notify.org/iss-now.json';
  
  /**
   * Fetches the current ISS position with exponential backoff for retries
   */
  static async fetchPosition(retries = 3, backoff = 1000): Promise<ISSPositionResponse> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Basic anomaly detection - data format check
      if (data.message !== 'success' || !data.iss_position || !data.iss_position.latitude || !data.iss_position.longitude) {
        throw new Error('Invalid data structure received from API');
      }
      
      return data;
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
