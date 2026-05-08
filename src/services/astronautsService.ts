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
  private static readonly API_URL = 'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json';

  static async fetchAstronauts(retries = 3, backoff = 1000): Promise<AstronautsResponse> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // Adapt to the expected structure in useAstronautsData.ts
      return {
        message: 'success',
        number: data.number,
        people: data.people.map((p: any) => ({
          name: p.name,
          craft: p.spacecraft || p.craft
        }))
      };
    } catch (error) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, backoff));
        return this.fetchAstronauts(retries - 1, backoff * 2);
      }
      throw error;
    }
  }
}
