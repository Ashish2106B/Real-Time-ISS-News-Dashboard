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

// Chat constants removed (persistence disabled)

// --- HUGGING FACE CONFIGURATION ---
// Paste your Hugging Face Access Token below
const HF_TOKEN = 'PASTE_YOUR_HF_TOKEN_HERE';
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

export class AIService {
  static loadHistory(): AIMessage[] {
    // Return empty array to start fresh every time (no persistent storage)
    return [];
  }

  static saveHistory(_messages: AIMessage[]): void {
    // Do nothing - don't store history in localStorage
  }

  static clearHistory(): void {
    // Persistence disabled - no history to clear
  }

  static async generateResponse(userInput: string, ctx: DashboardContext): Promise<string> {
    if (!isDashboardQuery(userInput)) {
      return "I only know dashboard data.";
    }

    // 1. Synthetic "Thinking" delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 2. Try Hugging Face first
    if (HF_TOKEN && !HF_TOKEN.includes('PASTE_YOUR')) {
      try {
        const contextStr = generateContext(ctx);
        const prompt = `[INST] You are NOVA, a Space Intelligence AI. 
INSTRUCTIONS:
1. GREETING: If the user greets you, provide a dynamic, professional greeting as a Space Intelligence Officer. If they do NOT greet you, skip the greeting entirely.
2. EXTRACTION: Extract ONLY the specific information requested from the data below. Be extremely concise.

DASHBOARD DATA:
${contextStr}

User Question: ${userInput} [/INST]`;

        const response = await fetch(
          `https://api-inference.huggingface.co/models/${HF_MODEL}`,
          {
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_new_tokens: 150,
                temperature: 0.4, // Lower temperature for more direct answers
                return_full_text: false,
              },
            }),
          }
        );

        const result = await response.json();
        if (Array.isArray(result) && result[0]?.generated_text) {
          let text = result[0].generated_text.trim();
          // Remove any remaining prompt artifacts
          text = text.replace(/THOUGHT:.*?\n/i, '').replace(/RESPONSE:/i, '').trim();
          return text;
        }
      } catch (error) {
        console.error('HF API Error:', error);
      }
    }

    // 2. Fallback to local knowledge base
    const local = buildLocalResponse(userInput, ctx);
    if (local) return local;

    return `🔭 Current Data:\n${generateContext(ctx)}`;
  }
}
