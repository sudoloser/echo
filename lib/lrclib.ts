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
      // Ensure there is exactly one space between timestamp and text
      return `${timestamp} ${line.text.trim()}`;
    })
    .join('\n');
}

export function parseLRCToLyrics(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const lyrics: LyricLine[] = [];
  // Updated regex to handle optional space after timestamp
  const timestampRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)$/;

  lines.forEach((line) => {
    const match = line.match(timestampRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3], 10);
      const text = match[4].trim();
      const start = minutes * 60 + seconds + centiseconds / 100;
      lyrics.push({
        id: Math.random().toString(36).substring(2, 11),
        start,
        end: null,
        text,
      });
    }
  });

  lyrics.sort((a, b) => a.start - b.start);
  for (let i = 0; i < lyrics.length - 1; i++) {
    lyrics[i].end = lyrics[i + 1].start;
  }

  return lyrics;
}

/**
 * Checks if the lyrics string is "synced" (contains LRC timestamps).
 */
export function isSynced(lrc: string): boolean {
  return /\[\d{2}:\d{2}\.\d{2,3}\]/.test(lrc);
}
