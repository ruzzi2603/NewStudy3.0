export type YouTubeUrlValidation = {
  valid: boolean;
  normalizedUrl: string | null;
  videoId: string | null;
  message: string;
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube.com",
  "www.youtu.be",
  "www.youtube-nocookie.com",
]);

export function parseYouTubeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function extractYouTubeVideoId(input: string | URL): string | null {
  const url = typeof input === "string" ? parseYouTubeUrl(input) : input;
  if (!url) return null;

  const host = normalizeHost(url.hostname);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const candidate = pathParts[0] || null;
    return candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
  }

  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (url.pathname === "/watch") {
      const candidate = url.searchParams.get("v");
      return candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
    }

    if (pathParts[0] === "shorts" || pathParts[0] === "embed" || pathParts[0] === "live") {
      const candidate = pathParts[1] || null;
      return candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
    }
  }

  return null;
}

export function normalizeYouTubeUrl(input: string | URL): string | null {
  const url = typeof input === "string" ? parseYouTubeUrl(input) : input;
  if (!url) return null;

  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

export function validateYouTubeUrl(input: string): YouTubeUrlValidation {
  const url = parseYouTubeUrl(input);

  if (!url) {
    return {
      valid: false,
      normalizedUrl: null,
      videoId: null,
      message: "Cole um link do YouTube válido, como youtube.com/watch?v=... ou youtu.be/....",
    };
  }

  const host = normalizeHost(url.hostname);
  if (!YOUTUBE_HOSTS.has(host)) {
    return {
      valid: false,
      normalizedUrl: null,
      videoId: null,
      message: "O link precisa ser do YouTube. Aceitamos youtube.com, youtu.be, shorts, live e embed.",
    };
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return {
      valid: false,
      normalizedUrl: null,
      videoId: null,
      message: "Informe um vídeo do YouTube válido. Playlists e links genéricos não são aceitos.",
    };
  }

  return {
    valid: true,
    normalizedUrl: normalizeYouTubeUrl(url),
    videoId,
    message: "",
  };
}
