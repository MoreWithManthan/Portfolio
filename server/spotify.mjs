// Server-only: never import this module into a client component.
export function createSpotifyService(env, fetcher = fetch) {
  let token = '',
    expires = 0,
    refresh = env.SPOTIFY_REFRESH_TOKEN;
  let cached = { track: null },
    cachedUntil = 0,
    pending;
  async function update() {
    try {
      if (Date.now() >= expires) {
        const response = await fetcher(
          'https://accounts.spotify.com/api/token',
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refresh,
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok) throw Error();
        const data = await response.json();
        if (typeof data.access_token !== 'string') throw Error();
        token = data.access_token;
        expires =
          Date.now() +
          Math.max(0, (Number(data.expires_in) || 3600) - 60) * 1000;
        if (typeof data.refresh_token === 'string')
          refresh = data.refresh_token;
      }
      const response = await fetcher(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok) {
        if (response.status === 401) expires = 0;
        throw Error();
      }
      const item = (await response.json()).items?.[0];
      const track = item?.track;
      const url = track?.external_urls?.spotify;
      cached =
        track &&
        typeof track.name === 'string' &&
        /^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/.test(url || '')
          ? {
              track: {
                title: track.name,
                artists: (track.artists || [])
                  .map((a) => a.name)
                  .filter((n) => typeof n === 'string')
                  .join(', '),
                url,
                playedAt:
                  typeof item.played_at === 'string' ? item.played_at : null,
              },
            }
          : { track: null };
      cachedUntil = Date.now() + 60000;
      return cached;
    } catch {
      // No raw Spotify errors or credential values reach a visitor.
      cached = { track: null };
      cachedUntil = Date.now() + 60000;
      throw new Error('Spotify is unavailable');
    }
  }
  return async function getLastPlayed() {
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !refresh)
      return { track: null };
    if (Date.now() < cachedUntil) return cached;
    if (!pending)
      pending = update().finally(() => {
        pending = undefined;
      });
    return pending;
  };
}
