# leaguestoolkit Worker

A Cloudflare Worker that proxies player lookups to the OSRS wiki's WikiSync
endpoint. Keeps the frontend stateless and lets us add CORS, rate limits,
or caching later without touching the React app.

## First-time setup

1. **Install dependencies**

   ```powershell
   cd worker
   npm install
   ```

2. **Authenticate with Cloudflare**

   ```powershell
   npx wrangler login
   ```

   This opens a browser window. Approve the OAuth prompt to link your CF
   account to the Wrangler CLI.

3. **Run it locally**

   ```powershell
   npx wrangler dev
   ```

   The Worker will serve on `http://localhost:8787`. Test it:

   ```powershell
   curl http://localhost:8787/health
   ```

   Should return `{"ok":true,"service":"leaguestoolkit-api"}`.

4. **Point the frontend at it**

   In the project root (`leaguestoolkit/`), create a `.env.local` file:

   ```
   VITE_WORKER_URL=http://localhost:8787
   ```

   Restart `npm run dev` in the frontend so Vite picks up the new env var.

## Deploying to production

1. **CORS is already configured** for `leaguestoolkit.com`, `www.leaguestoolkit.com`,
   `leaguestoolkit.pages.dev`, and localhost in `src/worker.js`. If you add another
   domain or preview URL later, append it to `ALLOWED_ORIGINS` and redeploy.

2. **Deploy**

   ```powershell
   npx wrangler deploy
   ```

   Wrangler prints the deployed URL — something like
   `https://leaguestoolkit-api.YOUR-SUBDOMAIN.workers.dev`.

3. **Update the frontend's production env var.**

   In Cloudflare Pages → Settings → Environment Variables, set:

   ```
   VITE_WORKER_URL = https://leaguestoolkit-api.YOUR-SUBDOMAIN.workers.dev
   ```

   Then trigger a Pages redeploy so the new value is baked into the build.

## Watching logs

```powershell
npx wrangler tail
```

Streams every request the Worker handles. Useful when the wiki endpoint
schema changes or you're debugging a specific username.

## Notes on the WikiSync endpoint

The Worker tries multiple profile names in order: `LEAGUE_6`, `LEAGUE_5`,
`STANDARD`. If Demonic Pacts uses a different profile string (Jagex
sometimes names them after the league theme), edit the `PROFILES` array in
`src/worker.js`.

If WikiSync's response schema for league task data differs from
`leagues_tasks: [...]`, adjust `mapWikiSyncToToolkit()` accordingly. The
function currently returns the raw payload as `result.raw` for debugging —
remove that field once you've confirmed the mapping.
