import { TranscriptSegment } from "../types.js";
import {
  extractYouTubeVideoId,
  normalizeYouTubeUrl,
  validateYouTubeUrl,
} from "../utils/youtube.js";

type CaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
  name?: {
    simpleText?: string;
  };
};

export type YouTubeSourceContext = {
  videoId: string;
  canonicalUrl: string;
  title: string;
  channelTitle: string;
  description: string;
  duration: string;
  transcriptLanguage: string | null;
  transcriptSegments: TranscriptSegment[];
  transcriptText: string;
  hasTranscript: boolean;
};

const YOUTUBE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};

function formatTimestamp(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }

  const rounded = Math.floor(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const mm = String(minutes + hours * 60).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${ss}`;
  }

  return `${mm}:${ss}`;
}

function extractJsonAssignment(source: string, symbolName: string): unknown | null {
  const symbolIndex = source.indexOf(symbolName);
  if (symbolIndex === -1) return null;

  const equalsIndex = source.indexOf("=", symbolIndex);
  if (equalsIndex === -1) return null;

  let index = equalsIndex + 1;
  while (index < source.length && /\s/.test(source[index])) index += 1;

  const firstChar = source[index];
  if (firstChar !== "{" && firstChar !== "[") return null;

  const openChar = firstChar;
  const closeChar = openChar === "{" ? "}" : "]";
  const start = index;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        const jsonText = source.slice(start, index + 1);
        try {
          return JSON.parse(jsonText);
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function chooseCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (!tracks.length) return null;

  let bestTrack: CaptionTrack | null = null;
  let bestScore = -Infinity;

  for (const track of tracks) {
    const language = (track.languageCode || "").toLowerCase();
    let score = 0;

    if (language === "pt-br") score += 100;
    else if (language.startsWith("pt")) score += 90;
    else if (language === "en") score += 70;
    else score += 10;

    if (track.kind === "asr") score -= 8;
    if (track.name?.simpleText) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestTrack = track;
    }
  }

  return bestTrack;
}

function buildTranscriptSegments(events: any[]): TranscriptSegment[] {
  if (!Array.isArray(events)) return [];

  return events
    .map((event): TranscriptSegment | null => {
      const text = Array.isArray(event?.segs)
        ? event.segs
            .map((segment: any) => (typeof segment?.utf8 === "string" ? segment.utf8 : ""))
            .join("")
            .replace(/\n+/g, " ")
            .trim()
        : "";
      const startMs = typeof event?.tStartMs === "number" ? event.tStartMs : Number(event?.tStartMs);
      if (!text || !Number.isFinite(startMs)) return null;
      return {
        time: formatTimestamp(startMs / 1000),
        text,
      };
    })
    .filter((segment): segment is TranscriptSegment => Boolean(segment));
}

function buildTranscriptText(segments: TranscriptSegment[], maxChars = 12000): string {
  const joined = segments.map((segment) => `[${segment.time}] ${segment.text}`).join("\n");
  if (joined.length <= maxChars) {
    return joined;
  }

  return `${joined.slice(0, maxChars)}\n[Transcricao truncada para caber no contexto da analise.]`;
}

export async function fetchYouTubeSourceContext(inputUrl: string): Promise<YouTubeSourceContext> {
  const validation = validateYouTubeUrl(inputUrl);
  if (!validation.valid || !validation.normalizedUrl || !validation.videoId) {
    throw new Error(validation.message || "URL do YouTube invalida.");
  }

  const canonicalUrl = normalizeYouTubeUrl(validation.normalizedUrl) || validation.normalizedUrl;
  const videoId = extractYouTubeVideoId(validation.normalizedUrl) || validation.videoId;

  const watchUrl = new URL(canonicalUrl);
  watchUrl.searchParams.set("hl", "pt-BR");
  watchUrl.searchParams.set("persist_hl", "1");
  watchUrl.searchParams.set("persist_gl", "1");

  const [oembedResponse, pageResponse] = await Promise.all([
    fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`,
      { headers: YOUTUBE_HEADERS }
    ).catch(() => null),
    fetch(watchUrl.toString(), { headers: YOUTUBE_HEADERS }).catch(() => null),
  ]);

  let oembed: any = null;
  if (oembedResponse && oembedResponse.ok) {
    oembed = await oembedResponse.json().catch(() => null);
  }

  const html = pageResponse && pageResponse.ok ? await pageResponse.text().catch(() => "") : "";
  const playerResponse = html ? extractJsonAssignment(html, "ytInitialPlayerResponse") : null;
  const player = playerResponse && typeof playerResponse === "object" ? (playerResponse as Record<string, any>) : {};
  const videoDetails = player.videoDetails && typeof player.videoDetails === "object" ? player.videoDetails : {};
  const captions = player.captions && typeof player.captions === "object" ? player.captions : {};
  const trackList = captions.playerCaptionsTracklistRenderer?.captionTracks;
  const tracks = Array.isArray(trackList) ? (trackList as CaptionTrack[]) : [];
  const selectedTrack = chooseCaptionTrack(tracks);

  let transcriptSegments: TranscriptSegment[] = [];
  let transcriptLanguage: string | null = null;

  if (selectedTrack?.baseUrl) {
    const transcriptUrl = new URL(selectedTrack.baseUrl);
    transcriptUrl.searchParams.set("fmt", "json3");
    const transcriptResponse = await fetch(transcriptUrl.toString(), { headers: YOUTUBE_HEADERS }).catch(() => null);
    if (transcriptResponse && transcriptResponse.ok) {
      const transcriptJson = await transcriptResponse.json().catch(() => null);
      transcriptSegments = buildTranscriptSegments(transcriptJson?.events || []);
      transcriptLanguage = selectedTrack.languageCode || null;
    }
  }

  const title = typeof videoDetails.title === "string" && videoDetails.title.trim()
    ? videoDetails.title.trim()
    : typeof oembed?.title === "string" && oembed.title.trim()
      ? oembed.title.trim()
      : "Material de estudo do YouTube";

  const description = typeof videoDetails.shortDescription === "string" && videoDetails.shortDescription.trim()
    ? videoDetails.shortDescription.trim()
    : typeof oembed?.description === "string" && oembed.description.trim()
      ? oembed.description.trim()
      : "";

  const channelTitle = typeof videoDetails.author === "string" && videoDetails.author.trim()
    ? videoDetails.author.trim()
    : typeof oembed?.author_name === "string" && oembed.author_name.trim()
      ? oembed.author_name.trim()
      : "";

  const durationSeconds = Number(videoDetails.lengthSeconds || 0);
  const duration = Number.isFinite(durationSeconds) && durationSeconds > 0
    ? formatTimestamp(durationSeconds)
    : "";

  return {
    videoId,
    canonicalUrl,
    title,
    channelTitle,
    description,
    duration,
    transcriptLanguage,
    transcriptSegments,
    transcriptText: buildTranscriptText(transcriptSegments),
    hasTranscript: transcriptSegments.length > 0,
  };
}
