export interface Astronaut {
  name: string;
  craft: string;
}

export interface AstronautsResponse {
  message: string;
  number: number;
  people: Astronaut[];
}

export class AstronautsService {
  private static readonly API_URL = 'http://api.open-notify.org/astros.json';

  static async fetchAstronauts(retries = 3, backoff = 1000): Promise<AstronautsResponse> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.message !== 'success') throw new Error('Invalid data from API');
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, backoff));
        return this.fetchAstronauts(retries - 1, backoff * 2);
      }
      throw error;
    }
  }
}
