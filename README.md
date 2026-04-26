# leaguestoolkit

OSRS Leagues calculators and task tools. Built with Vite + React, deployed
on Cloudflare Pages with a Cloudflare Worker for player lookups.

## Local development

```powershell
# Frontend
cd leaguestoolkit
npm install
npm run dev          # http://localhost:5173

# Worker (in a second terminal)
cd worker
npm install
npx wrangler login   # one-time
npx wrangler dev     # http://localhost:8787
```

Copy `.env.example` to `.env.local` and set:

```
VITE_WORKER_URL=http://localhost:8787
```

## Project layout

```
leaguestoolkit/
├── src/
│   ├── App.jsx                    # mounts <OSRSToolkit />
│   ├── main.jsx                   # React entry
│   └── components/
│       └── OSRSToolkit.jsx        # all six tools, custom OSRS theme
├── public/
│   └── _headers                   # Cloudflare Pages security headers
├── worker/
│   ├── src/worker.js              # WikiSync proxy
│   ├── wrangler.toml
│   ├── package.json
│   └── README.md                  # Worker deploy steps
├── .env.example
└── README.md
```

## Deploying

See `worker/README.md` for the Worker. For the Pages frontend:

1. Push this repo to GitHub.
2. Cloudflare dashboard → Pages → Create project → Connect to Git.
3. Build command: `npm run build`. Build output: `dist`.
4. Set the env var `VITE_WORKER_URL` to your deployed Worker URL.
5. Trigger a build.
