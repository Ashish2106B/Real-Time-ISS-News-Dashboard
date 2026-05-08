import type { SpaceArticle } from './newsService';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DashboardContext {
  issLat?: number;
  issLon?: number;
  issSpeed?: number;
  issTimestamp?: number;
  trajectoryCount?: number;
  astronautCount?: number;
  astronauts?: { name: string; craft: string }[];
  recentNews?: Pick<SpaceArticle, 'title' | 'news_site' | 'published_at'>[];
  avgSpeed?: number;
  maxSpeed?: number;
}

const SPACE_PATTERNS = [
  /iss|space station|station/i,
  /astronaut|cosmonaut|crew|people in space/i,
  /speed|velocity|km\/h|fast/i,
  /orbit|trajectory|path|position/i,
  /news|article|report/i,
  /nasa|spacex|roscosmos|esa|jaxa/i,
  /satellite|rocket|launch/i,
  /moon|mars|planet|star|galaxy/i,
  /altitude|apogee|perigee/i,
  /hello|hi|hey|help|what|how|who|where|when|why/i,
  /average|maximum|minimum|count|total/i,
  /coordinate|latitude|longitude/i,
];

function isDashboardQuery(text: string): boolean {
  return SPACE_PATTERNS.some(p => p.test(text));
}

export function generateContext(ctx: DashboardContext): string {
  const lines: string[] = ['=== LIVE DASHBOARD DATA ==='];

  if (ctx.issLat !== undefined && ctx.issLon !== undefined) {
    lines.push(`ISS Position: Lat ${ctx.issLat.toFixed(4)}°, Lon ${ctx.issLon.toFixed(4)}°`);
    lines.push(`ISS Speed: ${ctx.issSpeed ? Math.round(ctx.issSpeed).toLocaleString() : 'N/A'} km/h`);
    if (ctx.issTimestamp) {
      lines.push(`Last Updated: ${new Date(ctx.issTimestamp * 1000).toUTCString()}`);
    }
    lines.push(`Trajectory Points Tracked: ${ctx.trajectoryCount ?? 0}`);
    if (ctx.avgSpeed) lines.push(`Average Speed: ${Math.round(ctx.avgSpeed).toLocaleString()} km/h`);
    if (ctx.maxSpeed) lines.push(`Max Speed: ${Math.round(ctx.maxSpeed).toLocaleString()} km/h`);
  }

  if (ctx.astronautCount !== undefined) {
    lines.push(`\nPeople Currently in Space: ${ctx.astronautCount}`);
    ctx.astronauts?.forEach(a => lines.push(`  - ${a.name} aboard ${a.craft}`));
  }

  if (ctx.recentNews?.length) {
    lines.push('\nLatest Space News Headlines:');
    ctx.recentNews.slice(0, 5).forEach((n, i) =>
      lines.push(`  ${i + 1}. "${n.title}" — ${n.news_site}`)
    );
  }

  lines.push('=== END DASHBOARD DATA ===');
  return lines.join('\n');
}

function buildLocalResponse(input: string, ctx: DashboardContext): string | null {
  const low = input.toLowerCase();

  if (/hello|hi|hey|greetings/.test(low)) {
    return `👋 Hello, Commander! I'm NOVA — your Space Intelligence AI. I only answer using live dashboard data. Try asking about the ISS position, crew, speed, or latest news!`;
  }
  if (/help|what can you/.test(low)) {
    return `🛰️ I can answer using live dashboard data:\n• ISS position & speed\n• Crew currently in space\n• Speed analytics\n• Latest news headlines\n\nAsk me anything dashboard-related!`;
  }
  if (/speed|velocity|fast/.test(low) && ctx.issSpeed) {
    const avg = ctx.avgSpeed ? ` (avg: ${Math.round(ctx.avgSpeed).toLocaleString()} km/h)` : '';
    return `🚀 The ISS is currently moving at **${Math.round(ctx.issSpeed).toLocaleString()} km/h**${avg}. That's about Mach 23 — fast enough to circle Earth in ~92 minutes!`;
  }
  if (/position|where|location|coordinate|lat|lon/.test(low) && ctx.issLat !== undefined) {
    return `📍 The ISS is currently at:\n• Latitude: **${ctx.issLat.toFixed(4)}°**\n• Longitude: **${ctx.issLon!.toFixed(4)}°**\n\nUpdated: ${ctx.issTimestamp ? new Date(ctx.issTimestamp * 1000).toLocaleTimeString() : 'N/A'}`;
  }
  if (/astronaut|crew|people|space|cosmonaut/.test(low) && ctx.astronautCount !== undefined) {
    const names = ctx.astronauts?.map(a => `${a.name} (${a.craft})`).join(', ') ?? '';
    return `👨‍🚀 There are currently **${ctx.astronautCount} people** in space:\n${names}`;
  }
  if (/news|article|headline/.test(low) && ctx.recentNews?.length) {
    const headlines = ctx.recentNews.slice(0, 3).map((n, i) => `${i + 1}. "${n.title}" — *${n.news_site}*`).join('\n');
    return `📰 Latest space news:\n${headlines}`;
  }
  if (/orbit|trajectory|path/.test(low)) {
    return `🌍 The ISS follows a near-circular Low Earth Orbit (LEO) at ~408 km altitude, inclined 51.6°. I've tracked **${ctx.trajectoryCount ?? 0}** positions so far this session.`;
  }
  if (/average|avg/.test(low) && ctx.avgSpeed) {
    return `📊 Average ISS speed this session: **${Math.round(ctx.avgSpeed).toLocaleString()} km/h** over ${ctx.trajectoryCount} tracked points.`;
  }
  if (/maximum|max/.test(low) && ctx.maxSpeed) {
    return `📈 Maximum speed recorded this session: **${Math.round(ctx.maxSpeed).toLocaleString()} km/h**.`;
  }

  return null;
}

const STORAGE_KEY = 'nova_chat_history';
const MAX_MESSAGES = 30;

export class AIService {
  static loadHistory(): AIMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  static saveHistory(messages: AIMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
    } catch {}
  }

  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static async generateResponse(userInput: string, ctx: DashboardContext): Promise<string> {
    if (!isDashboardQuery(userInput)) {
      return "I only know dashboard data.";
    }

    // Try local knowledge base first
    const local = buildLocalResponse(userInput, ctx);
    if (local) return local;

    // Fallback: generic but honest
    return `🔭 Based on current dashboard data:\n\n${generateContext(ctx)}\n\nThat's everything I have right now. Try asking specifically about ISS speed, position, crew, or news!`;
  }
}
