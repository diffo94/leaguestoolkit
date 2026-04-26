// Cloudflare Worker for leaguestoolkit
// ---------------------------------------------------------------------------
// Routes:
//   POST /wiki-lookup     — Look up a player's Leagues task data from the
//                           OSRS wiki's WikiSync endpoint.
//
// CORS: configured via ALLOWED_ORIGINS below. Add your deployed domain to
//       the list before going to production.
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
  "http://localhost:5173",              // Vite dev server
  "http://localhost:4173",              // Vite preview server
  "https://leaguestoolkit.com",         // production domain
  "https://www.leaguestoolkit.com",     // www variant — Cloudflare commonly redirects but include it for safety
  "https://leaguestoolkit.pages.dev",   // Pages preview / fallback URL
];

const ALLOW_ALL_ORIGINS = false;  // flip to true for permissive dev — DO NOT ship like this

// ---------------------------------------------------------------------------
// Simple per-IP rate limiter
// ---------------------------------------------------------------------------
// In-memory, per-isolate. Not cross-region perfect (each edge location has its
// own isolate) but it catches obvious abuse from a single source without
// requiring a paid plan or KV namespace. Returns false when the caller should
// be rejected.
// ---------------------------------------------------------------------------

const RATE_LIMIT = 30;          // requests…
const RATE_WINDOW_MS = 60_000;  // …per 60 seconds, per IP
const rateMap = new Map();

function checkRateLimit(ip) {
  if (!ip) return true; // can't identify caller — let it through
  const now = Date.now();
  const recent = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateMap.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateMap.set(ip, recent);
  // Opportunistic cleanup so the Map can't grow unbounded.
  if (rateMap.size > 1000) {
    for (const [k, v] of rateMap) {
      const filtered = v.filter((t) => now - t < RATE_WINDOW_MS);
      if (filtered.length === 0) rateMap.delete(k);
      else rateMap.set(k, filtered);
    }
  }
  return true;
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = ALLOW_ALL_ORIGINS || ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0] || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(body, status, request, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
      ...extra,
    },
  });
}

// ---------------------------------------------------------------------------
// /wiki-lookup
// ---------------------------------------------------------------------------
// Hits WikiSync for a player's synced data. Endpoint format has been stable
// across leagues:
//   https://sync.runescape.wiki/runelite/player/{username}/STANDARD
// If Demonic Pacts league uses a different "profile" name (e.g. LEAGUE_6),
// you may need to try multiple profile names — adjust PROFILES below.
// ---------------------------------------------------------------------------

const PROFILES = ["LEAGUE_6", "LEAGUE_5", "STANDARD"];
const WIKISYNC_BASE = "https://sync.runescape.wiki/runelite/player";

async function handleWikiLookup(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!checkRateLimit(ip)) {
    return jsonResponse(
      { error: `Rate limit exceeded. Max ${RATE_LIMIT} lookups per minute.` },
      429,
      request,
      { "Retry-After": "60" },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, request);
  }

  const username = (body.username || "").trim();
  if (!username || username.length > 12 || !/^[a-zA-Z0-9 _-]+$/.test(username)) {
    return jsonResponse(
      { error: "Username must be 1–12 chars: letters, digits, spaces, _ or -" },
      400,
      request,
    );
  }

  const encoded = encodeURIComponent(username);
  const errors = [];

  for (const profile of PROFILES) {
    const url = `${WIKISYNC_BASE}/${encoded}/${profile}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "leaguestoolkit (github.com/your-handle)" },
      });
      if (res.status === 404) {
        errors.push(`${profile}: not found`);
        continue;
      }
      if (!res.ok) {
        errors.push(`${profile}: ${res.status}`);
        continue;
      }
      const data = await res.json();
      // Map the WikiSync response into the shape the frontend expects.
      const result = mapWikiSyncToToolkit(data, profile, username);
      return jsonResponse(result, 200, request);
    } catch (e) {
      errors.push(`${profile}: ${e.message}`);
    }
  }

  return jsonResponse(
    {
      found: false,
      note:
        `No WikiSync data found for "${username}". Make sure the WikiSync ` +
        `RuneLite plugin is installed and you've logged in at least once ` +
        `since enabling it. Tried: ${errors.join("; ")}.`,
      completedTasks: [],
      skills: {},
    },
    200,
    request,
  );
}

// Translate the raw WikiSync payload to the shape the frontend renders.
// WikiSync's response shape (subject to change with new leagues):
//   {
//     username: "...",
//     timestamp: ...,
//     leagues_tasks: [taskId, taskId, ...],   // for league profiles
//     levels: { Thieving: 99, Fishing: 95, ... },
//     ...
//   }
// If the schema differs for Demonic Pacts, adjust the field reads below.
function mapWikiSyncToToolkit(data, profile, username) {
  const completedIds =
    data.leagues_tasks ||
    data.tasks ||
    data.completed_tasks ||
    [];

  const skills = data.levels || data.skills || {};

  return {
    found: true,
    username: data.username || username,
    profile,
    completedCount: Array.isArray(completedIds) ? completedIds.length : null,
    totalTasks: null, // WikiSync doesn't provide this; UI can hard-code from task list
    totalPoints: null, // same — needs join with task definitions
    completedTasks: Array.isArray(completedIds) ? completedIds : [],
    skills,
    note: `Synced from WikiSync (${profile}). Task IDs returned; UI can join with the league's task list to show names/points.`,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/wiki-lookup" && request.method === "POST") {
      return handleWikiLookup(request);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "leaguestoolkit-api" }, 200, request);
    }

    return jsonResponse({ error: "Not found" }, 404, request);
  },
};
