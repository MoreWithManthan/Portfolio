// Run locally to authorize the portfolio owner's listening history once.
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { chmod, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const id = process.env.SPOTIFY_CLIENT_ID,
  secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret)
  throw Error(
    'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first.',
  );
const redirect = 'http://127.0.0.1:8888/callback';
const state = randomBytes(32).toString('hex');
const auth = new URL('https://accounts.spotify.com/authorize');
auth.search = new URLSearchParams({
  client_id: id,
  response_type: 'code',
  redirect_uri: redirect,
  scope: 'user-read-recently-played',
  state,
}).toString();
const server = createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname != '/callback') {
    res.writeHead(404).end();
    return;
  }
  const returned = Buffer.from(url.searchParams.get('state') || '');
  if (
    returned.length !== state.length ||
    !timingSafeEqual(returned, Buffer.from(state))
  ) {
    res.writeHead(400).end('Invalid state. Start again.');
    return;
  }
  try {
    const code = url.searchParams.get('code');
    if (!code) throw Error();
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirect,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error();
    const data = await response.json();
    if (typeof data.refresh_token !== 'string') throw Error();
    await writeFile(
      '.env.spotify',
      `SPOTIFY_REFRESH_TOKEN=${JSON.stringify(data.refresh_token)}\n`,
      { mode: 0o600 },
    );
    await chmod('.env.spotify', 0o600);
    res
      .writeHead(200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      })
      .end('Spotify connected. You can close this tab.');
    console.log(
      'Saved your private refresh token to .env.spotify. Do not commit or share that file.',
    );
  } catch {
    res
      .writeHead(400, { 'Content-Type': 'text/plain' })
      .end('Spotify authorization failed. Check app settings and try again.');
  } finally {
    clearTimeout(timeout);
    server.close();
  }
});
server.listen(8888, '127.0.0.1', () =>
  console.log(`Open this URL in your browser to connect Spotify:\n${auth}`),
);
const timeout = setTimeout(() => {
  server.close();
  console.error('Authorization timed out. Run the command again.');
}, 600000);
server.on('error', () => {
  clearTimeout(timeout);
  console.error(
    'Could not start the local callback. Check that port 8888 is free.',
  );
  process.exitCode = 1;
});
