export interface Astronaut {
  name: string;
  craft: string;
  image?: string;
}

const PRIMARY_URL = 'https://corquaid.github.io/international-space-station-api/api/astronauts.json';
const FALLBACK_URL = 'https://api.open-notify.org/astros.json';

export const AstronautsService = {
  async fetchAstronauts(): Promise<{ people: Astronaut[], number: number }> {
    try {
      const response = await fetch(PRIMARY_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const people = data.map((p: any) => ({
        name: p.name,
        craft: p.spacecraft || p.craft || 'ISS',
        image: p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff`
      }));
      return { people, number: people.length };
    } catch (err) {
      console.warn('Astronauts Primary API failed, trying fallback...', err);
      try {
        const response = await fetch(FALLBACK_URL);
        if (!response.ok) throw new Error('Fallback failed');
        const data = await response.json();
        return {
          people: data.people.map((p: any) => ({
            name: p.name,
            craft: p.craft || 'ISS',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff`
          })),
          number: data.number
        };
      } catch (fallbackErr) {
        console.error('All Astronaut APIs failed', fallbackErr);
        throw err;
      }
    }
  }
};
