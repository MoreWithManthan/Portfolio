# Spotify last played

The email address is plain text in the intro. Only the last contact section uses an Email me button.

The Spotify row is implemented, but **not connected to Manthan’s account yet**. It stays hidden when no real song is available. No sample listening activity is published. The currently hosted Site is a static export: its `/api/spotify.json` intentionally returns `{"track":null}` until an API is connected.

## Connect your account locally

1. Create an app at https://developer.spotify.com/dashboard. Enable Web API and register this exact redirect URI: `http://127.0.0.1:8888/callback`. Your account/app must meet Spotify’s current development-mode eligibility requirements.
2. Copy `.env.example` to `.env.local`. Put your app’s client ID and client secret into `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. Do not use a `NEXT_PUBLIC_` prefix for secrets.
3. Run `bun run spotify:connect` (Node 20.6+). Open the printed Spotify authorization link and approve access to recently played tracks. The helper saves the refresh token in `.env.spotify` with private file permissions; it does not print the token.
4. Run `bun run build`, then `node --env-file=.env.local --env-file=.env.spotify scripts/serve.mjs`. Open `http://localhost:3000`. The bundled Node server now serves the portfolio and the real last-played endpoint. Credentials are read only by the server.

The endpoint returns only song title, artist names, Spotify track link and played time. Browser checks run every minute while visible; the server caches results for one minute and coalesces simultaneous requests. It refreshes access tokens automatically. Spotify may require you to authorize the app again later; rerun the connection helper then. Any replacement refresh token is kept in server memory, so reauthorize if Spotify invalidates an old token after a restart.

## Put Spotify on the hosted portfolio

The existing static Site cannot read server secrets. Run the bundled Node service on a Node-capable host, set the three `SPOTIFY_*` credentials there using the host’s secret settings, and set `SPOTIFY_ALLOWED_ORIGIN` to the portfolio origin (no trailing slash). Configure `NEXT_PUBLIC_SPOTIFY_ENDPOINT` to that service’s public HTTPS `/api/spotify.json` URL, then rebuild the static portfolio. Only this public endpoint URL belongs in client configuration.

Alternatively, a server-backed deployment of the whole codebase can use the same-origin endpoint directly. The current Site has not been migrated to server-backed hosting. Do not set secrets on a static host and expect the feature to work. Connecting the Spotify ChatGPT plugin does not provide the website with reusable server authorization.

Keep `.env.local` and `.env.spotify` private. They are ignored by Git and excluded from the code ZIP. No password is needed. Only the owner authorizes; portfolio visitors do not sign into Spotify.

## References

- [Spotify recently played endpoint and required scope](https://developer.spotify.com/documentation/web-api/reference/get-recently-played)
- [Authorization code flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [Refreshing tokens](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
