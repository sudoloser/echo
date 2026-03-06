import CryptoJS from 'crypto-js';

export interface LyricLine {
  id: string;
  start: number;
  end: number | null;
  text: string;
}

export function formatLyricsToLRC(lyrics: LyricLine[]): string {
  return lyrics
    .map((line) => {
      const minutes = Math.floor(line.start / 60);
      const seconds = Math.floor(line.start % 60);
      const centiseconds = Math.floor((line.start % 1) * 100);
      const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]`;
      return `${timestamp}${line.text}`;
    })
    .join('\n');
}

export function parseLRCToLyrics(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const lyrics: LyricLine[] = [];
  const timestampRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/;

  lines.forEach((line, index) => {
    const match = line.match(timestampRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3], 10);
      const text = match[4].trim();
      const start = minutes * 60 + seconds + centiseconds / 100;
      lyrics.push({
        id: Math.random().toString(36).substr(2, 9),
        start,
        end: null,
        text,
      });
    }
  });

  // Sort by start time and fill 'end' times
  lyrics.sort((a, b) => a.start - b.start);
  for (let i = 0; i < lyrics.length - 1; i++) {
    lyrics[i].end = lyrics[i + 1].start;
  }

  return lyrics;
}

interface ChallengeResponse {
  prefix: string;
  target: string;
}

async function solveChallenge(prefix: string, target: string): Promise<string> {
  let nonce = 0;
  while (true) {
    const nonceStr = nonce.toString();
    const hash = CryptoJS.SHA256(prefix + nonceStr).toString();
    if (hash < target) {
      return nonceStr;
    }
    nonce++;
    if (nonce % 1000 === 0) {
      // Yield to UI thread occasionally if needed, 
      // though in JS this will still block unless using a Worker.
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

export async function publishLyrics(
  trackName: string,
  artistName: string,
  albumName: string,
  duration: number,
  lrcText: string,
  userAgent: string
) {
  const baseUrl = 'https://lrclib.net/api';

  // 1. Request challenge
  const challengeRes = await fetch(`${baseUrl}/request-challenge`, {
    method: 'POST',
    headers: {
      'User-Agent': userAgent,
    },
  });

  if (!challengeRes.ok) {
    throw new Error('Failed to request challenge');
  }

  const challenge: ChallengeResponse = await challengeRes.json();

  // 2. Solve challenge
  const nonce = await solveChallenge(challenge.prefix, challenge.target);

  // 3. Publish
  const publishRes = await fetch(`${baseUrl}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'X-Publish-Token': `${challenge.prefix}:${nonce}`,
    },
    body: JSON.stringify({
      trackName,
      artistName,
      albumName,
      duration,
      lyrics: lrcText,
    }),
  });

  if (!publishRes.ok) {
    const errorData = await publishRes.json();
    throw new Error(errorData.message || 'Failed to publish lyrics');
  }

  return await publishRes.json();
}
