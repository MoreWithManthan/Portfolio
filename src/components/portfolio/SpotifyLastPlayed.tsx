'use client';

import { useEffect, useState } from 'react';

type Track = { title: string; artists: string; url: string };
export default function SpotifyLastPlayed() {
  const [track, setTrack] = useState<Track | null>(null);
  useEffect(() => {
    let fetching = false;
    let stopped = false,
      controller: AbortController | null = null;
    const endpoint =
      process.env.NEXT_PUBLIC_SPOTIFY_ENDPOINT || '/api/spotify.json';
    async function refresh() {
      if (document.hidden || fetching) return;
      fetching = true;
      controller?.abort();
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10000);
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw Error();
        const song = (await response.json()).track;
        const valid =
          song &&
          typeof song.title === 'string' &&
          typeof song.artists === 'string' &&
          /^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/.test(
            song.url || '',
          );
        if (!stopped) setTrack(valid ? song : null);
      } catch {
        if (!stopped) setTrack(null);
      } finally {
        clearTimeout(timeout);
        fetching = false;
      }
    }
    void refresh();
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      stopped = true;
      clearInterval(timer);
      controller?.abort();
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  if (!track) return null;
  return (
    <div className="spotify-last-played">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-label="Spotify"
        role="img"
      >
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <g fill="none" stroke="#fff" strokeLinecap="round">
          <path d="M5 8.5c4-1.2 9-1 14 1" strokeWidth="2" />
          <path d="M5.8 12c4-1 8-.6 12 1" strokeWidth="1.8" />
          <path d="M6.5 15.5c3-.7 6.5-.4 10 1" strokeWidth="1.6" />
        </g>
      </svg>
      <span>Last played</span>
      <span aria-hidden="true">—</span>
      <a href={track.url} target="_blank" rel="noreferrer">
        {track.title}
        <span> · {track.artists}</span>
      </a>
    </div>
  );
}
