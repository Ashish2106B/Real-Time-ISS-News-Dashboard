export interface ISSLocationResponse {
  message: string;
  timestamp: number;
  iss_position: {
    latitude: string;
    longitude: string;
  };
}

const PRIMARY_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const FALLBACK_URL = 'https://api.open-notify.org/iss-now.json';

export const ISSService = {
  async fetchPosition(): Promise<ISSLocationResponse> {
    try {
      const response = await fetch(PRIMARY_URL);
      if (!response.ok) throw new Error('Primary ISS API failed');
      const data = await response.json();
      return {
        message: 'success',
        timestamp: data.timestamp,
        iss_position: {
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString()
        }
      };
    } catch (err) {
      console.warn('ISS Primary API failed, trying fallback...', err);
      try {
        const response = await fetch(FALLBACK_URL);
        if (!response.ok) throw new Error('Fallback ISS API failed');
        return await response.json();
      } catch (fallbackErr) {
        console.error('All ISS APIs failed', fallbackErr);
        throw err;
      }
    }
  }
};
