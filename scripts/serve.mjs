import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createSpotifyService } from '../server/spotify.mjs';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const base = resolve(root);
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be between 1 and 65535.');
if (!existsSync(resolve(base, 'index.html')))
  throw new Error('Run bun run build first.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};
const spotify = createSpotifyService(process.env);
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
  } catch {
    res.writeHead(400);
    res.end('Invalid URL');
    return;
  }
  if (pathname === '/api/spotify.json') {
    if (
      process.env.SPOTIFY_ALLOWED_ORIGIN &&
      req.headers.origin === process.env.SPOTIFY_ALLOWED_ORIGIN
    ) {
      res.setHeader(
        'Access-Control-Allow-Origin',
        process.env.SPOTIFY_ALLOWED_ORIGIN,
      );
      res.setHeader('Vary', 'Origin');
    }
    let data,
      status = 200;
    try {
      data = await spotify();
    } catch {
      data = { track: null };
      status = 503;
    }
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify(data));
    return;
  }
  let file = resolve(base, '.' + pathname);
  if (file !== base && !file.startsWith(base + sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  let status = 200;
  try {
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    await stat(file);
  } catch {
    file = resolve(base, '404.html');
    status = 404;
  }
  try {
    const content = await readFile(file);
    res.writeHead(status, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, () => console.log(`Portfolio: http://localhost:${port}`));
