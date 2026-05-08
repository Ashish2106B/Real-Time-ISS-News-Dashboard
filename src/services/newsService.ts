export interface SpaceArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

export class NewsService {
  private static readonly API_URL = 'https://api.spaceflightnewsapi.net/v4/articles/?limit=12';

  static async fetchArticles(retries = 3, backoff = 1000): Promise<SpaceArticle[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (!data || !Array.isArray(data.results)) {
        throw new Error('Invalid response structure from News API');
      }
      
      return data.results;
    } catch (error) {
      if (retries > 0) {
        console.warn(`News fetch failed, retrying in ${backoff}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.fetchArticles(retries - 1, backoff * 2);
      }
      throw error;
    }
  }
}
