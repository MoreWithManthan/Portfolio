import { expect, test } from 'bun:test';

import { createSpotifyService } from '../server/spotify.mjs';

const env = {
  SPOTIFY_CLIENT_ID: 'test-id',
  SPOTIFY_CLIENT_SECRET: 'test-secret',
  SPOTIFY_REFRESH_TOKEN: 'test-refresh',
};
test('Spotify stays empty without credentials and never calls the provider', async () => {
  const service = createSpotifyService({}, () => {
    throw Error('must not fetch');
  });
  expect(await service()).toEqual({ track: null });
});
test('Spotify refreshes server-side and returns only public song data, cached across requests', async () => {
  const calls = [];
  const service = createSpotifyService(env, async (url, options) => {
    calls.push([url, options]);
    if (url.includes('/api/token'))
      return Response.json({
        access_token: 'private-access',
        expires_in: 3600,
      });
    return Response.json({
      items: [
        {
          played_at: '2026-09-15T03:00:00Z',
          track: {
            name: 'Test song',
            artists: [{ name: 'Test artist' }],
            external_urls: { spotify: 'https://open.spotify.com/track/test' },
          },
        },
      ],
    });
  });
  const result = await service();
  expect(result.track.title).toBe('Test song');
  expect(result.track.artists).toBe('Test artist');
  expect(JSON.stringify(result)).not.toContain('private-access');
  expect(calls[1][1].headers.Authorization).toBe('Bearer private-access');
  await service();
  expect(calls.length).toBe(2);
});
test('Spotify rejects failed authorization without returning provider secrets', async () => {
  const service = createSpotifyService(env, async () =>
    Response.json({ error: 'test-secret' }, { status: 401 }),
  );
  await expect(service()).rejects.toThrow('Spotify is unavailable');
});
test('Spotify handles no history and does not publish unsafe links', async () => {
  for (const items of [
    [],
    [
      {
        track: {
          name: 'Example',
          artists: [{ name: 'Example' }],
          external_urls: { spotify: 'javascript:alert(1)' },
        },
      },
    ],
  ]) {
    const service = createSpotifyService(env, async (url) =>
      Response.json(
        url.includes('/api/token')
          ? { access_token: 'private', expires_in: 3600 }
          : { items },
      ),
    );
    expect(await service()).toEqual({ track: null });
  }
});
