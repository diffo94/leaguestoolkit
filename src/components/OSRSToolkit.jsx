import { useState, useMemo } from "react";

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0d0d0d; }

  .osrs-wrap { min-height: 100vh; background: #0d0d0d; font-family: 'Cinzel', serif; color: #e8d5a3; }

  /* ── Tab Bar ── */
  .tab-bar {
    background: linear-gradient(180deg, #1a0a00 0%, #2d1500 50%, #1a0a00 100%);
    border-bottom: 2px solid #8b6914;
    display: flex;
    align-items: stretch;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 24px rgba(0,0,0,0.8);
  }
  .tab-brand {
    padding: 14px 24px;
    display: flex; align-items: center; gap: 10px;
    border-right: 1px solid #3a2a0a;
    flex-shrink: 0;
  }
  .tab-brand-icon { font-size: 1.6rem; filter: drop-shadow(0 0 8px #ff9900aa); }
  .tab-brand-title { font-size: 1rem; font-weight: 700; color: #f5c842; letter-spacing: 0.08em; white-space: nowrap; }
  .tab-brand-sub { font-family: 'Crimson Text', serif; font-size: 0.75rem; color: #b89a6a; }

  .tab-list { display: flex; align-items: stretch; }
  .tab-btn {
    background: transparent; color: #b89a6a; border: none;
    padding: 0 22px; font-family: 'Cinzel', serif; font-size: 0.72rem;
    letter-spacing: 0.08em; cursor: pointer; white-space: nowrap;
    border-right: 1px solid #2a1f0a;
    transition: all 0.15s; position: relative;
    display: flex; align-items: center; gap: 7px;
  }
  .tab-btn:hover { color: #f5c842; background: #1a1200; }
  .tab-btn.active {
    color: #f5c842; background: #1a1200;
    box-shadow: inset 0 -3px 0 #f5c842;
  }
  .tab-icon { font-size: 1rem; }

  /* ── Shared Controls ── */
  .controls {
    background: #111; border-bottom: 1px solid #2a1f0a;
    padding: 20px 28px; display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-end;
  }
  .control-group { display: flex; flex-direction: column; gap: 6px; }
  .control-label { font-size: 0.62rem; letter-spacing: 0.12em; color: #b89a6a; text-transform: uppercase; }

  input[type="range"] {
    -webkit-appearance: none; width: 200px; height: 4px;
    background: linear-gradient(to right, #8b6914, #f5c842); border-radius: 2px; outline: none; cursor: pointer;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
    background: #f5c842; border: 2px solid #1a0a00; box-shadow: 0 0 8px #f5c842aa; cursor: pointer;
  }

  .spinner-wrap {
    display: flex; align-items: center; border: 1px solid #3a2a0a; border-radius: 4px; overflow: hidden; height: 32px;
  }
  .spinner-input {
    background: #1a1200; color: #f5c842; border: none;
    border-left: 1px solid #3a2a0a; border-right: 1px solid #3a2a0a;
    width: 56px; text-align: center; font-family: 'Cinzel', serif;
    font-size: 0.9rem; font-weight: 600; outline: none; height: 100%;
    -moz-appearance: textfield;
  }
  .spinner-input::-webkit-inner-spin-button, .spinner-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .spin-btn {
    background: #1a1200; color: #c9a870; border: none; width: 28px; height: 100%;
    font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.1s, color 0.1s; user-select: none; flex-shrink: 0;
  }
  .spin-btn:hover { background: #2d1f00; color: #f5c842; }
  .spin-btn:active { background: #3d2a00; }

  .seg-group { display: flex; border: 1px solid #3a2a0a; border-radius: 4px; overflow: hidden; }
  .seg-btn {
    background: #1a1200; color: #c9a870; border: none; padding: 7px 13px;
    font-family: 'Cinzel', serif; font-size: 0.68rem; letter-spacing: 0.06em;
    cursor: pointer; border-right: 1px solid #3a2a0a; transition: all 0.15s;
  }
  .seg-btn:last-child { border-right: none; }
  .seg-btn.active { background: #2d1f00; color: #f5c842; box-shadow: inset 0 -2px 0 #f5c842; }
  .seg-btn:hover:not(.active) { background: #221800; color: #c9a84c; }

  .toggle-btn {
    background: #1a1200; color: #c9a870; border: 1px solid #3a2a0a;
    padding: 7px 14px; font-family: 'Cinzel', serif; font-size: 0.68rem;
    letter-spacing: 0.06em; cursor: pointer; border-radius: 4px; transition: all 0.15s; height: 32px;
  }
  .toggle-btn.on { background: #1a2d00; color: #7ec842; border-color: #4a7a1a; box-shadow: inset 0 -2px 0 #7ec842; }

  .leagues-select {
    background: #1a1200; color: #c9a870; border: 1px solid #3a2a0a; border-radius: 4px;
    padding: 6px 26px 6px 10px; font-family: 'Cinzel', serif; font-size: 0.68rem;
    letter-spacing: 0.06em; cursor: pointer; outline: none; height: 32px;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23b89a6a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
    transition: color 0.15s, border-color 0.15s;
  }
  .leagues-select.active-league { color: #f5c842; border-color: #8b6914; box-shadow: inset 0 -2px 0 #f5c842; }
  .leagues-select:hover { border-color: #5a4a1a; color: #f5c842; }
  .leagues-select option { background: #1a1200; color: #e8d5a3; }

  /* ── Best banner ── */
  .best-banner {
    margin: 20px 28px 0;
    background: linear-gradient(135deg, #1a1200 0%, #2d1f00 50%, #1a1200 100%);
    border: 1px solid #8b6914; border-radius: 6px; padding: 14px 20px;
    display: flex; align-items: center; gap: 16px;
    box-shadow: 0 0 24px #8b691422, inset 0 1px 0 #f5c84222;
  }
  .best-badge {
    background: #f5c842; color: #1a0a00; font-size: 0.55rem; font-weight: 700;
    letter-spacing: 0.14em; padding: 3px 8px; border-radius: 2px; white-space: nowrap;
  }
  .best-food { font-size: 1.05rem; font-weight: 600; color: #f5c842; }
  .best-stats { font-family: 'Crimson Text', serif; font-size: 0.95rem; color: #c9a84c; margin-left: auto; }

  /* ── Tables ── */
  .table-wrap { margin: 20px 28px 28px; border: 1px solid #2a1f0a; border-radius: 6px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #1a1200; border-bottom: 2px solid #3a2a0a; }
  th {
    padding: 10px 14px; text-align: left; font-size: 0.60rem; letter-spacing: 0.12em;
    color: #b89a6a; text-transform: uppercase; cursor: pointer; user-select: none;
    white-space: nowrap; transition: color 0.15s;
  }
  th:hover { color: #f5c842; }
  th.sorted { color: #f5c842; }
  tr { border-bottom: 1px solid #1e1600; transition: background 0.1s; }
  tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #1a1200; }
  tbody tr.top-row { background: #1e1900; }
  td { padding: 10px 14px; font-family: 'Crimson Text', serif; font-size: 0.97rem; color: #c9a84c; vertical-align: middle; }
  td.name-cell { font-family: 'Cinzel', serif; font-size: 0.78rem; color: #e8d5a3; display: flex; align-items: center; gap: 8px; }

  .burn-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .burn-bar-bg { width: 76px; height: 6px; background: #1e1600; border-radius: 3px; overflow: hidden; }
  .burn-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

  .xphr-cell { font-family: 'Cinzel', serif; font-weight: 600; font-size: 0.85rem; }
  .rank-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%; font-size: 0.62rem; font-weight: 700;
    font-family: 'Cinzel', serif; flex-shrink: 0;
  }
  .rank-1 { background: #f5c842; color: #1a0a00; }
  .rank-2 { background: #c0c0c0; color: #1a0a00; }
  .rank-3 { background: #cd7f32; color: #1a0a00; }
  .rank-other { background: #2a1f0a; color: #b89a6a; }
  .sort-arrow { margin-left: 4px; opacity: 0.6; }

  /* ── Stat cards ── */
  .stat-grid { display: flex; flex-wrap: wrap; gap: 16px; padding: 20px 28px 0; }
  .stat-card {
    background: linear-gradient(135deg, #1a1200, #221800);
    border: 1px solid #3a2a0a; border-radius: 6px; padding: 16px 20px;
    min-width: 160px; flex: 1;
  }
  .stat-card-label { font-size: 0.58rem; letter-spacing: 0.12em; color: #8b7355; text-transform: uppercase; margin-bottom: 6px; }
  .stat-card-value { font-size: 1.4rem; font-weight: 700; color: #f5c842; text-shadow: 0 0 12px #f5c84244; }
  .stat-card-unit { font-family: 'Crimson Text', serif; font-size: 0.8rem; color: #8b7355; margin-left: 4px; }
  .stat-card-sub { font-family: 'Crimson Text', serif; font-size: 0.82rem; color: #b89a6a; margin-top: 3px; }

  /* ── Prayer progress bar ── */
  .xp-bar-wrap { margin: 20px 28px 0; }
  .xp-bar-label { font-size: 0.62rem; letter-spacing: 0.12em; color: #b89a6a; text-transform: uppercase; margin-bottom: 6px; }
  .xp-bar-bg { height: 10px; background: #1a1200; border: 1px solid #3a2a0a; border-radius: 5px; overflow: hidden; }
  .xp-bar-fill { height: 100%; background: linear-gradient(to right, #8b6914, #f5c842); border-radius: 5px; transition: width 0.4s; }
  .xp-bar-text { font-family: 'Crimson Text', serif; font-size: 0.82rem; color: #b89a6a; margin-top: 4px; }

  /* ── Footer ── */
  .footer-note {
    text-align: center; padding: 0 28px 24px;
    font-family: 'Crimson Text', serif; font-style: italic; font-size: 0.82rem; color: #8b7355;
  }

  /* ── Section headers ── */
  .section-header {
    padding: 20px 28px 0;
    font-size: 0.65rem; letter-spacing: 0.14em; color: #8b7355; text-transform: uppercase;
    border-top: 1px solid #1e1600; margin-top: 20px;
  }
  .section-header:first-of-type { border-top: none; margin-top: 0; }
`;

// ─── PRAYER XP TABLE ──────────────────────────────────────────────────────────
const PRAYER_XP = [0,83,174,276,388,512,650,801,969,1154,1358,1584,1833,2107,2411,2746,3115,3523,3973,4470,5018,5624,6291,7028,7842,8740,9730,10824,12031,13363,14833,16456,18247,20224,22406,24815,27473,30408,33648,37224,41171,45529,50339,55649,61512,67983,75127,83014,91721,101333,112012,123660,136594,150872,166636,184040,203254,224466,247886,273742,302288,333804,368599,407015,449428,496254,547953,605032,667991,737627,814445,899257,992895,1096278,1210421,1336443,1475581,1629200,1798808,1986068,2192818,2421087,2673114,2951373,3258594,3597792,3972294,4385776,4842295,5346332,5902831,6517253,7195629,7944614,8771558,9684577,10692629,11805606,13034431];

function xpForLevel(l) { return PRAYER_XP[Math.min(99, Math.max(1, l)) - 1]; }
function xpToLevel(xp) {
  for (let i = 98; i >= 0; i--) { if (xp >= PRAYER_XP[i]) return i + 1; }
  return 1;
}

// ─── COOKING DATA ─────────────────────────────────────────────────────────────
const FOODS = [
  { name: "Shrimp",      icon: "🦐", req: 1,  xp: 30,  burnStopFire: 34,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Sardine",     icon: "🐟", req: 1,  xp: 40,  burnStopFire: 38,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Herring",     icon: "🐟", req: 5,  xp: 50,  burnStopFire: 41,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Anchovies",   icon: "🐟", req: 1,  xp: 30,  burnStopFire: 34,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Mackerel",    icon: "🐟", req: 10, xp: 60,  burnStopFire: 45,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Trout",       icon: "🐟", req: 15, xp: 70,  burnStopFire: 49,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Cod",         icon: "🐟", req: 18, xp: 75,  burnStopFire: 51,  burnStopRange: 49,   burnStopGauntlets: null },
  { name: "Pike",        icon: "🐟", req: 20, xp: 80,  burnStopFire: 54,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Salmon",      icon: "🐟", req: 25, xp: 90,  burnStopFire: 58,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Tuna",        icon: "🐠", req: 30, xp: 100, burnStopFire: 63,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Lobster",     icon: "🦞", req: 40, xp: 120, burnStopFire: 74,  burnStopRange: 74,   burnStopGauntlets: 64 },
  { name: "Bass",        icon: "🐟", req: 43, xp: 130, burnStopFire: 79,  burnStopRange: null, burnStopGauntlets: null },
  { name: "Swordfish",   icon: "🐡", req: 45, xp: 140, burnStopFire: 86,  burnStopRange: 80,   burnStopGauntlets: 80 },
  { name: "Monkfish",    icon: "🐟", req: 62, xp: 150, burnStopFire: 92,  burnStopRange: 90,   burnStopGauntlets: 82 },
  { name: "Karambwan",   icon: "🦑", req: 30, xp: 190, burnStopFire: 999, burnStopRange: null, burnStopGauntlets: null },
  { name: "Shark",       icon: "🦈", req: 80, xp: 210, burnStopFire: 999, burnStopRange: 999,  burnStopGauntlets: 94 },
  { name: "Sea Turtle",  icon: "🐢", req: 82, xp: 211, burnStopFire: 999, burnStopRange: 999,  burnStopGauntlets: null },
  { name: "Manta Ray",   icon: "🐠", req: 91, xp: 216, burnStopFire: 999, burnStopRange: 999,  burnStopGauntlets: null },
  { name: "Dark Crab",   icon: "🦀", req: 90, xp: 215, burnStopFire: 999, burnStopRange: 999,  burnStopGauntlets: null },
  { name: "Anglerfish",  icon: "🎣", req: 84, xp: 230, burnStopFire: 999, burnStopRange: 999,  burnStopGauntlets: 97 },
];

function getBurnChance(food, cookingLevel, location, gauntlets) {
  if (cookingLevel < food.req) return null;
  let burnStop;
  if (gauntlets && food.burnStopGauntlets) {
    burnStop = location === "fire" ? food.burnStopFire : food.burnStopGauntlets;
  } else if (location === "fire") {
    burnStop = food.burnStopFire;
  } else {
    burnStop = food.burnStopRange ?? food.burnStopFire;
  }
  if (burnStop >= 999) {
    const maxBurnRates = { "Karambwan": 0.40, "Shark": 0.62, "Sea Turtle": 0.64, "Manta Ray": 0.66, "Dark Crab": 0.65, "Anglerfish": 0.63 };
    const maxBurn = maxBurnRates[food.name] ?? 0.50;
    const decay = Math.max(0.20, 1 - ((cookingLevel - food.req) / (99 - food.req)) * 0.80);
    return maxBurn * decay;
  }
  if (cookingLevel >= burnStop) return 0;
  const range = burnStop - food.req;
  if (range <= 0) return 0;
  const burnChance = Math.max(0, 1 - ((cookingLevel - food.req) / range));
  const maxBurnRates = { "Shrimp": 0.42, "Sardine": 0.45, "Herring": 0.43, "Anchovies": 0.44, "Mackerel": 0.46, "Trout": 0.47, "Cod": 0.45, "Pike": 0.46, "Salmon": 0.50, "Tuna": 0.52, "Lobster": 0.55, "Bass": 0.56, "Swordfish": 0.58, "Monkfish": 0.60, "Karambwan": 0.40, "Shark": 0.62, "Sea Turtle": 0.64, "Manta Ray": 0.66, "Dark Crab": 0.65, "Anglerfish": 0.63 };
  return burnChance * (maxBurnRates[food.name] ?? 0.50);
}

const BANK_TIME_S = 8, COOK_TIME_S = 1.2, FISH_PER_INV = 28, SECS_PER_TILE = 0.6;
function getActionsPerHour(tiles) {
  const tripTime = tiles * 2 * SECS_PER_TILE + BANK_TIME_S + FISH_PER_INV * COOK_TIME_S;
  return Math.round((FISH_PER_INV / tripTime) * 3600);
}

// ─── KARAMBWAN DATA (OSRS Wiki) ───────────────────────────────────────────────
// Catch rate at level 65: ~41.8% per tick (wiki data point)
// Formula approximated linearly from 65→99: 41.8% → ~66%
// Karambwanji per catch: floor(level/5) + 1, capped at 20 (level 95+)
// Bait theft rate: ~2.3 karambwanji consumed per karambwan at level 65, ~1.5 at 99
// Standard AFK: ~400–600/hr (wiki). Trip ~4 min with fairy ring banking.
// XP per karambwan: 50 fishing XP
function getKarambwanPerHour(fishLevel) {
  // Wiki states 450/hr at lvl 65 no extras, 875/hr at 99 with all extras (fish barrel, angler)
  // We model standard AFK with no barrel, no outfit: ~400 at 65, ~600 at 99
  const t = Math.max(0, Math.min(1, (fishLevel - 65) / 34));
  return Math.round(400 + t * 200);
}

function getKarambwanjiPerCatch(fishLevel) {
  return Math.min(20, 1 + Math.floor(fishLevel / 5));
}

// Theft rate: karambwanji consumed per karambwan caught (wiki fandom: 2-3 at 70, lower at higher levels)
function getBaitConsumedPerKarambwan(fishLevel) {
  // At 65: ~2.8, at 99: ~1.4, linear interpolation
  return Math.max(1.4, 2.8 - ((fishLevel - 65) / 34) * 1.4);
}

// How long to fish X karambwanji at given level (minutes)
function getKarambwanjiCatchTimeMinutes(fishLevel, count) {
  // Wiki: at 65 takes 6.5 min for 1hr bait supply; at 99 takes 4 min
  // Approx catch rate: each "catch action" every ~6 ticks (3.6s), yields karambwanji per catch
  const ticksPerAction = 6; // approx
  const secsPerAction = ticksPerAction * 0.6;
  const perCatch = getKarambwanjiPerCatch(fishLevel);
  const actionsNeeded = Math.ceil(count / perCatch);
  return (actionsNeeded * secsPerAction) / 60;
}

// ─── FISHING XP TABLE ─────────────────────────────────────────────────────────
const FISHING_XP = [0,83,174,276,388,512,650,801,969,1154,1358,1584,1833,2107,2411,2746,3115,3523,3973,4470,5018,5624,6291,7028,7842,8740,9730,10824,12031,13363,14833,16456,18247,20224,22406,24815,27473,30408,33648,37224,41171,45529,50339,55649,61512,67983,75127,83014,91721,101333,112012,123660,136594,150872,166636,184040,203254,224466,247886,273742,302288,333804,368599,407015,449428,496254,547953,605032,667991,737627,814445,899257,992895,1096278,1210421,1336443,1475581,1629200,1798808,1986068,2192818,2421087,2673114,2951373,3258594,3597792,3972294,4385776,4842295,5346332,5902831,6517253,7195629,7944614,8771558,9684577,10692629,11805606,13034431];
const COOKING_XP  = [0,83,174,276,388,512,650,801,969,1154,1358,1584,1833,2107,2411,2746,3115,3523,3973,4470,5018,5624,6291,7028,7842,8740,9730,10824,12031,13363,14833,16456,18247,20224,22406,24815,27473,30408,33648,37224,41171,45529,50339,55649,61512,67983,75127,83014,91721,101333,112012,123660,136594,150872,166636,184040,203254,224466,247886,273742,302288,333804,368599,407015,449428,496254,547953,605032,667991,737627,814445,899257,992895,1096278,1210421,1336443,1475581,1629200,1798808,1986068,2192818,2421087,2673114,2951373,3258594,3597792,3972294,4385776,4842295,5346332,5902831,6517253,7195629,7944614,8771558,9684577,10692629,11805606,13034431];
const CRAFTING_XP = [0,83,174,276,388,512,650,801,969,1154,1358,1584,1833,2107,2411,2746,3115,3523,3973,4470,5018,5624,6291,7028,7842,8740,9730,10824,12031,13363,14833,16456,18247,20224,22406,24815,27473,30408,33648,37224,41171,45529,50339,55649,61512,67983,75127,83014,91721,101333,112012,123660,136594,150872,166636,184040,203254,224466,247886,273742,302288,333804,368599,407015,449428,496254,547953,605032,667991,737627,814445,899257,992895,1096278,1210421,1336443,1475581,1629200,1798808,1986068,2192818,2421087,2673114,2951373,3258594,3597792,3972294,4385776,4842295,5346332,5902831,6517253,7195629,7944614,8771558,9684577,10692629,11805606,13034431];

function xpForSkillLevel(table, l) { return table[Math.min(99, Math.max(1, l)) - 1]; }
function levelForXp(table, xp) { for (let i = 98; i >= 0; i--) { if (xp >= table[i]) return i + 1; } return 1; }

// ─── LEAGUES XP THRESHOLDS COMPONENT ─────────────────────────────────────────
const LEAGUE_XP_TASKS = [
  { label: "25M XP", xp: 25_000_000 },
  { label: "35M XP", xp: 35_000_000 },
  { label: "50M XP", xp: 50_000_000 },
];

function LeagueXpPanel({ currentXp, xpPerHour, label = "Fishing" }) {
  return (
    <div style={{ margin: "0 28px", background: "#1a1200", border: "1px solid #3a2a0a", borderRadius: 6, padding: "14px 18px" }}>
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase", marginBottom: 10 }}>
        ⚔ Leagues Task XP Thresholds — {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {LEAGUE_XP_TASKS.map(({ label: tLabel, xp }) => {
          const xpLeft = Math.max(0, xp - currentXp);
          const hoursLeft = xpPerHour > 0 ? xpLeft / xpPerHour : null;
          const done = xpLeft === 0;
          return (
            <div key={tLabel} style={{ textAlign: "center", minWidth: 90 }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", color: done ? "#7ec842" : "#8b7355", textTransform: "uppercase", marginBottom: 4 }}>{tLabel}</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 600, color: done ? "#7ec842" : "#f5c842", fontFamily: "'Cinzel', serif" }}>
                {done ? "✓ Done" : hoursLeft !== null ? (hoursLeft < 1 ? `${Math.ceil(hoursLeft * 60)}m` : `${hoursLeft.toFixed(1)}h`) : "—"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#8b7355", fontFamily: "'Crimson Text', serif", marginTop: 2 }}>
                {done ? `${xp.toLocaleString()} XP` : `${xpLeft.toLocaleString()} XP left`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DESIRED LEVEL PANEL ──────────────────────────────────────────────────────
function DesiredLevelPanel({ currentLevel, xpPerHour, xpTable, skillName }) {
  const [targetLevel, setTargetLevel] = useState(Math.min(99, currentLevel + 5));
  const safeTarget = Math.max(currentLevel + 1, Math.min(99, targetLevel));
  const currentXp = xpForSkillLevel(xpTable, currentLevel);
  const targetXp = xpForSkillLevel(xpTable, safeTarget);
  const xpNeeded = Math.max(0, targetXp - currentXp);
  const hoursNeeded = xpPerHour > 0 ? xpNeeded / xpPerHour : null;
  const progressPct = Math.min(100, (currentXp / targetXp) * 100);

  return (
    <div style={{ margin: "12px 28px 0", background: "#1a1200", border: "1px solid #3a2a0a", borderRadius: 6, padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase", marginBottom: 6 }}>Desired {skillName} Level</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Spinner value={safeTarget} onChange={v => setTargetLevel(Math.max(currentLevel + 1, Math.min(99, v)))} min={Math.min(99, currentLevel + 1)} max={99} />
            <input type="range" min={Math.min(99, currentLevel + 1)} max={99} value={safeTarget} onChange={e => setTargetLevel(Number(e.target.value))} style={{ width: 140 }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", color: "#8b7355", textTransform: "uppercase", marginBottom: 4 }}>
            Lvl {currentLevel} → {safeTarget} &nbsp;·&nbsp; {xpNeeded.toLocaleString()} XP needed
          </div>
          <div style={{ height: 8, background: "#111", border: "1px solid #2a1f0a", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(to right, #8b6914, #f5c842)", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "0.82rem", color: "#b89a6a" }}>
            {hoursNeeded !== null
              ? hoursNeeded < 1
                ? `~${Math.ceil(hoursNeeded * 60)} minutes at current rate`
                : `~${hoursNeeded.toFixed(1)} hours at current rate`
              : "Set an XP rate above to estimate time"}
          </div>
        </div>
      </div>
    </div>
  );
}


function Spinner({ value, onChange, min = 1, max = 99, width = 56 }) {
  return (
    <div className="spinner-wrap">
      <button className="spin-btn" onClick={() => onChange(Math.max(min, value - 1))}>▼</button>
      <input
        className="spinner-input" type="number" min={min} max={max}
        style={{ width }}
        value={value}
        onChange={e => {
          const v = parseInt(e.target.value);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
      />
      <button className="spin-btn" onClick={() => onChange(Math.min(max, value + 1))}>▲</button>
    </div>
  );
}

// ─── LEAGUES SELECT ───────────────────────────────────────────────────────────
function LeaguesSelect({ value, onChange }) {
  return (
    <div className="control-group">
      <span className="control-label">Leagues XP Multiplier</span>
      <select className={`leagues-select ${value > 1 ? "active-league" : ""}`} value={value} onChange={e => onChange(Number(e.target.value))}>
        <option value={1}>— Standard (1×)</option>
        <option value={5}>⚔ Leagues (5×)</option>
        <option value={8}>⚔ Leagues (8×)</option>
        <option value={12}>⚔ Leagues (12×)</option>
        <option value={16}>⚔ Leagues (16×)</option>
      </select>
      {value > 1 && <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "0.75rem", color: "#f5c842", marginTop: "3px" }}>⚔ {value}× multiplier active</div>}
    </div>
  );
}

// ─── COOKING TOOL ─────────────────────────────────────────────────────────────
function CookingTool() {
  const [cookLevel, setCookLevel] = useState(70);
  const [location, setLocation] = useState("fire");
  const [gauntlets, setGauntlets] = useState(false);
  const [sortBy, setSortBy] = useState("xphr");
  const [bankTiles, setBankTiles] = useState(10);
  const [leaguesMulti, setLeaguesMulti] = useState(1);

  const actionsPerHour = useMemo(() => getActionsPerHour(bankTiles), [bankTiles]);

  const results = useMemo(() => FOODS.map(food => {
    if (cookLevel < food.req) return null;
    const burnChance = getBurnChance(food, cookLevel, location, gauntlets);
    if (burnChance === null) return null;
    const successRate = 1 - burnChance;
    const effectiveXp = food.xp * successRate * leaguesMulti;
    return { ...food, burnChance: Math.round(burnChance * 100), successRate: Math.round(successRate * 100), effectiveXp: effectiveXp.toFixed(1), xpHr: Math.round(effectiveXp * actionsPerHour) };
  }).filter(Boolean).sort((a, b) => sortBy === "xphr" ? b.xpHr - a.xpHr : sortBy === "burn" ? a.burnChance - b.burnChance : b.xp - a.xp), [cookLevel, location, gauntlets, sortBy, actionsPerHour, leaguesMulti]);

  const best = results[0];
  const cookingXpHr = best ? best.xpHr : 0;
  const currentCookXp = xpForSkillLevel(COOKING_XP, cookLevel);

  return (
    <>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">Cooking Level</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Spinner value={cookLevel} onChange={setCookLevel} min={1} max={99} />
            <input type="range" min={1} max={99} value={cookLevel} onChange={e => setCookLevel(Number(e.target.value))} />
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Location</span>
          <div className="seg-group">
            {[["fire","🔥 Fire"],["range","⚙️ Range"],["rogues","🏠 Rogues' Den"]].map(([val,label]) => (
              <button key={val} className={`seg-btn ${location===val?"active":""}`} onClick={() => setLocation(val)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Cooking Gauntlets</span>
          <button className={`toggle-btn ${gauntlets?"on":""}`} onClick={() => setGauntlets(g=>!g)}>{gauntlets?"✓ Equipped":"✗ Not Equipped"}</button>
        </div>
        <div className="control-group">
          <span className="control-label">Bank Distance (tiles)</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Spinner value={bankTiles} onChange={setBankTiles} min={0} max={100} />
            <div>
              <input type="range" min={0} max={100} value={bankTiles} onChange={e => setBankTiles(Number(e.target.value))} />
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Crimson Text',serif", fontSize:"0.68rem", color:"#8b7355", marginTop:"2px" }}>
                <span>0 (Rogues')</span><span>~10 (Hosidius)</span><span>100</span>
              </div>
            </div>
            <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"0.8rem", color:"#b89a6a", whiteSpace:"nowrap" }}>
              <span style={{ color:"#c9a84c", fontWeight:600 }}>{actionsPerHour.toLocaleString()}</span> actions/hr
            </div>
          </div>
        </div>
        <LeaguesSelect value={leaguesMulti} onChange={setLeaguesMulti} />
        <div className="control-group" style={{ marginLeft:"auto" }}>
          <span className="control-label">Sort By</span>
          <div className="seg-group">
            {[["xphr","XP/hr"],["burn","Burn %"],["xp","Raw XP"]].map(([val,label]) => (
              <button key={val} className={`seg-btn ${sortBy===val?"active":""}`} onClick={() => setSortBy(val)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {best && (
        <div className="best-banner">
          <span className="best-badge">{leaguesMulti>1?`⚔ ${leaguesMulti}× LEAGUES`:"TOP PICK"}</span>
          <span style={{fontSize:"1.4rem"}}>{best.icon}</span>
          <div>
            <div className="best-food">{best.name}</div>
            <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.85rem",color:"#b89a6a"}}>
              {best.burnChance===0?"No burn chance at this level":`${best.burnChance}% burn chance — ${best.successRate}% success rate`}
            </div>
          </div>
          <div className="best-stats">
            <strong style={{color:"#f5c842",fontSize:"1.1rem"}}>{best.xpHr.toLocaleString()}</strong>
            <span style={{fontSize:"0.78rem",color:"#8b7355"}}> XP/hr{leaguesMulti>1?` (${leaguesMulti}×)`:""}</span>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{width:40}}>#</th>
              <th>Food</th>
              <th className={sortBy==="xp"?"sorted":""} onClick={()=>setSortBy("xp")}>Base XP <span className="sort-arrow">{sortBy==="xp"?"▼":"↕"}</span></th>
              <th className={sortBy==="burn"?"sorted":""} onClick={()=>setSortBy("burn")}>Burn Chance <span className="sort-arrow">{sortBy==="burn"?"▼":"↕"}</span></th>
              <th>Eff. XP/Cook{leaguesMulti>1?` (${leaguesMulti}×)`:""}</th>
              <th className={sortBy==="xphr"?"sorted":""} onClick={()=>setSortBy("xphr")}>Est. XP/hr{leaguesMulti>1?` (${leaguesMulti}×)`:""} <span className="sort-arrow">{sortBy==="xphr"?"▼":"↕"}</span></th>
            </tr>
          </thead>
          <tbody>
            {results.map((food, i) => {
              const burnColor = food.burnChance===0?"#7ec842":food.burnChance<15?"#c9a84c":food.burnChance<35?"#e07030":"#cc3333";
              const rankClass = i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"rank-other";
              return (
                <tr key={food.name} className={i===0?"top-row":""}>
                  <td><span className={`rank-badge ${rankClass}`}>{i+1}</span></td>
                  <td>
                    <div className="name-cell">
                      <span style={{fontSize:"1.1rem"}}>{food.icon}</span>
                      {food.name}
                      {food.burnStopRange===null&&food.burnStopFire<999&&<span title="Fire and range are identical for this fish (OSRS Wiki)" style={{fontSize:"0.52rem",color:"#5a4a2a",cursor:"help"}}>🔥=⚙️</span>}
                      {food.burnStopFire>=999&&<span title="Never stops burning without Cooking cape" style={{fontSize:"0.52rem",color:"#7a3a1a",cursor:"help"}}>∞ BURN</span>}
                    </div>
                  </td>
                  <td style={{color:"#c9a84c"}}>{food.xp}</td>
                  <td>
                    <div className="burn-bar-wrap">
                      <div className="burn-bar-bg"><div className="burn-bar-fill" style={{width:`${food.burnChance}%`,background:burnColor}}/></div>
                      <span style={{color:burnColor,fontFamily:"'Cinzel',serif",fontSize:"0.78rem",fontWeight:600,minWidth:"36px"}}>{food.burnChance}%</span>
                    </div>
                  </td>
                  <td style={{color:"#c9a84c"}}>{food.effectiveXp}</td>
                  <td><span className="xphr-cell" style={{color:i===0?"#f5c842":i<3?"#c9a84c":"#b89a6a"}}>{food.xpHr.toLocaleString()}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DesiredLevelPanel currentLevel={cookLevel} xpPerHour={cookingXpHr} xpTable={COOKING_XP} skillName="Cooking" />
      {leaguesMulti > 1 && <div style={{marginTop:12}}><LeagueXpPanel currentXp={currentCookXp} xpPerHour={cookingXpHr} label="Cooking" /></div>}
      <div className="footer-note" style={{marginTop:16}}>XP/hr = 28 fish ÷ (round-trip walk + 8s bank + 33.6s cooking) × 3600. Running at 0.6s/tile. Burn rates from OSRS Wiki linear formula.</div>
    </>
  );
}

// ─── KARAMBWAN TOOL ───────────────────────────────────────────────────────────
function KarambwanTool() {
  const [fishLevel, setFishLevel] = useState(75);
  const [karambwanjiCount, setKarambwanjiCount] = useState(500);
  const [endlessHarvest, setEndlessHarvest] = useState(false);
  const [leaguesMulti, setLeaguesMulti] = useState(1);

  const perCatch = getKarambwanjiPerCatch(fishLevel);
  const baitPerKarambwan = getBaitConsumedPerKarambwan(fishLevel);

  // Endless Harvest: 2× catch rate, auto-banks (no trip overhead), no bait limit concern
  // XP is also doubled by the relic (wiki: "XP is granted for all additional resources")
  const baseCatchPerHour = getKarambwanPerHour(fishLevel);
  // With EH: double the catch rate, no banking overhead — we add ~15% efficiency bonus for no trips
  const catchPerHour = endlessHarvest
    ? Math.round(baseCatchPerHour * 2 * 1.15)
    : baseCatchPerHour;

  // XP per catch: 50 base × leagues multi × EH doubles the catches (already in catchPerHour)
  const xpPerKarambwan = 50 * leaguesMulti;
  const fishingXpPerHour = catchPerHour * xpPerKarambwan;

  // Bait: with EH, fish go to bank so bait still consumed at same rate per karambwan
  const karambwanFromBait = Math.floor(karambwanjiCount / baitPerKarambwan);
  const karambwanjiCatchTime = getKarambwanjiCatchTimeMinutes(fishLevel, karambwanjiCount);
  const karambwanFishTime = (karambwanFromBait / catchPerHour) * 60;
  const totalFishingXp = karambwanFromBait * xpPerKarambwan;
  const currentFishXp = xpForSkillLevel(FISHING_XP, fishLevel);

  return (
    <>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">Fishing Level</span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Spinner value={fishLevel} onChange={setFishLevel} min={65} max={99} />
            <input type="range" min={65} max={99} value={fishLevel} onChange={e => setFishLevel(Number(e.target.value))} />
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Raw Karambwanji on Hand</span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Spinner value={karambwanjiCount} onChange={setKarambwanjiCount} min={1} max={99999} width={72} />
            <input type="range" min={1} max={5000} value={Math.min(5000,karambwanjiCount)} onChange={e => setKarambwanjiCount(Number(e.target.value))} />
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Endless Harvest (Tier 1 Relic)</span>
          <button className={`toggle-btn ${endlessHarvest ? "on" : ""}`} onClick={() => setEndlessHarvest(h => !h)}>
            {endlessHarvest ? "✓ Endless Harvest ON" : "✗ No Endless Harvest"}
          </button>
          {endlessHarvest && (
            <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"0.72rem", color:"#f5c842", marginTop:2 }}>
              2× catches · 2× XP · Auto-bank · 25 min AFK
            </div>
          )}
        </div>
        <LeaguesSelect value={leaguesMulti} onChange={setLeaguesMulti} />
      </div>

      {endlessHarvest && (
        <div style={{ margin:"12px 28px 0", background:"#1a2d00", border:"1px solid #4a7a1a", borderRadius:6, padding:"10px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{fontSize:"1.2rem"}}>🌿</span>
          <div style={{fontFamily:"'Crimson Text',serif", fontSize:"0.88rem", color:"#7ec842"}}>
            <strong>Endless Harvest active</strong> — Resources doubled, auto-banked. AFK up to 25 minutes per session. No banking trips factored in.
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Karambwanji per Catch</div>
          <div className="stat-card-value">{perCatch}<span className="stat-card-unit">fish</span></div>
          <div className="stat-card-sub">floor({fishLevel}/5) + 1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Bait per Karambwan</div>
          <div className="stat-card-value">{baitPerKarambwan.toFixed(1)}<span className="stat-card-unit">avg</span></div>
          <div className="stat-card-sub">Theft rate, decreases with level</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Karambwan from Bait</div>
          <div className="stat-card-value">{karambwanFromBait.toLocaleString()}<span className="stat-card-unit">fish</span></div>
          <div className="stat-card-sub">{karambwanjiCount.toLocaleString()} ÷ {baitPerKarambwan.toFixed(1)}</div>
        </div>
        <div className="stat-card" style={endlessHarvest ? {border:"1px solid #4a7a1a"} : {}}>
          <div className="stat-card-label">Karambwan / Hour{endlessHarvest ? " 🌿" : ""}</div>
          <div className="stat-card-value" style={endlessHarvest ? {color:"#7ec842"} : {}}>{catchPerHour.toLocaleString()}<span className="stat-card-unit">/hr</span></div>
          <div className="stat-card-sub">{endlessHarvest ? "2× EH + no trip overhead" : "AFK, no barrel/outfit"}</div>
        </div>
      </div>

      <div className="stat-grid" style={{paddingTop:12}}>
        <div className="stat-card">
          <div className="stat-card-label">Time to Fish Karambwanji</div>
          <div className="stat-card-value">
            {karambwanjiCatchTime < 60
              ? <>{karambwanjiCatchTime.toFixed(1)}<span className="stat-card-unit">min</span></>
              : <>{(karambwanjiCatchTime/60).toFixed(2)}<span className="stat-card-unit">hr</span></>}
          </div>
          <div className="stat-card-sub">AFK net fishing at Holy Lake</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Time to Use All Bait</div>
          <div className="stat-card-value">
            {karambwanFishTime < 60
              ? <>{karambwanFishTime.toFixed(1)}<span className="stat-card-unit">min</span></>
              : <>{(karambwanFishTime/60).toFixed(2)}<span className="stat-card-unit">hr</span></>}
          </div>
          <div className="stat-card-sub">Fishing {karambwanFromBait.toLocaleString()} karambwan</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Fishing XP from Bait Stock{leaguesMulti>1?` (${leaguesMulti}×)`:""}</div>
          <div className="stat-card-value">{totalFishingXp.toLocaleString()}<span className="stat-card-unit">XP</span></div>
          <div className="stat-card-sub">{karambwanFromBait.toLocaleString()} × {xpPerKarambwan} XP</div>
        </div>
        <div className="stat-card" style={endlessHarvest||leaguesMulti>1 ? {border:"1px solid #8b6914"} : {}}>
          <div className="stat-card-label">Fishing XP / Hour{leaguesMulti>1?` (${leaguesMulti}×)`:""}{endlessHarvest?" 🌿":""}</div>
          <div className="stat-card-value" style={{color:"#f5c842"}}>{fishingXpPerHour.toLocaleString()}<span className="stat-card-unit">XP/hr</span></div>
          <div className="stat-card-sub">{xpPerKarambwan} XP × {catchPerHour}/hr</div>
        </div>
      </div>

      <div style={{margin:"12px 28px 0", background:"#1a1200", border:"1px solid #3a2a0a", borderRadius:6, padding:"14px 18px"}}>
        <div style={{fontSize:"0.6rem", letterSpacing:"0.12em", color:"#8b7355", textTransform:"uppercase", marginBottom:10}}>
          Karambwanji Needed to Fish for Set Time
        </div>
        <div style={{display:"flex", flexWrap:"wrap", gap:"20px"}}>
          {[30,60,120,240].map(mins => {
            const needed = Math.ceil((catchPerHour * (mins/60)) * baitPerKarambwan);
            return (
              <div key={mins} style={{textAlign:"center"}}>
                <div style={{fontSize:"1.1rem", fontWeight:600, color:"#f5c842", fontFamily:"'Cinzel',serif"}}>{needed.toLocaleString()}</div>
                <div style={{fontSize:"0.78rem", color:"#8b7355", fontFamily:"'Crimson Text',serif"}}>{mins < 60 ? `${mins}m` : `${mins/60}hr`}</div>
              </div>
            );
          })}
        </div>
      </div>

      <DesiredLevelPanel currentLevel={fishLevel} xpPerHour={fishingXpPerHour} xpTable={FISHING_XP} skillName="Fishing" />
      {leaguesMulti > 1 && <div style={{marginTop:12}}><LeagueXpPanel currentXp={currentFishXp} xpPerHour={fishingXpPerHour} label="Fishing" /></div>}

      <div className="footer-note" style={{marginTop:16}}>
        Catch rates: 400–600 karambwan/hr AFK (OSRS Wiki). Endless Harvest: 2× catches + 2× XP, auto-bank (no trip overhead).
        Bait theft rate scales with level. Karambwanji formula: floor(level/5)+1, capped at 20 at level 95+.
      </div>
    </>
  );
}

// ─── PRAYER TOOL ──────────────────────────────────────────────────────────────
// Shard values sourced from OSRS Wiki Module:Prayer/Blessed_Bone_Shards
// Ourg bones corrected to 112 via in-game testing (wiki calculator talk page, Feb 2026)
// Sun-kissed bones added from wiki blessed bone shards page (45 shards, Varlamore-specific)
const BONE_TYPES = [
  { name: "Bones",                 shards: 4,   note: "Basic bones",             prayReq: 1  },
  { name: "Bat Bones",             shards: 5,   note: "Bats etc.",               prayReq: 1  },
  { name: "Big Bones",             shards: 12,  note: "Ogres, giants",           prayReq: 1  },
  { name: "Zogre Bones",           shards: 18,  note: "Zogres",                  prayReq: 1  },
  { name: "Wyrmling Bones",        shards: 21,  note: "Baby wyrms",              prayReq: 1  },
  { name: "Babydragon Bones",      shards: 24,  note: "Baby dragons",            prayReq: 1  },
  { name: "Sun-kissed Bones",      shards: 45,  note: "Varlamore (untradeable)", prayReq: 1  },
  { name: "Wyrm Bones",            shards: 42,  note: "Wyrms",                   prayReq: 1  },
  { name: "Wyvern Bones",          shards: 58,  note: "Wyverns",                 prayReq: 1  },
  { name: "Dragon Bones",          shards: 58,  note: "Dragons",                 prayReq: 1  },
  { name: "Drake Bones",           shards: 64,  note: "Drakes",                  prayReq: 1  },
  { name: "Fayrg Bones",           shards: 67,  note: "Fayrg",                   prayReq: 1  },
  { name: "Lava Dragon Bones",     shards: 68,  note: "Lava dragons",            prayReq: 1  },
  { name: "Raurg Bones",           shards: 77,  note: "Raurg",                   prayReq: 1  },
  { name: "Hydra Bones",           shards: 93,  note: "Hydras",                  prayReq: 1  },
  { name: "Dagannoth Bones",       shards: 100, note: "Dagannoth Kings",         prayReq: 1  },
  { name: "Frost Dragon Bones",    shards: 84,  note: "Frost dragons",           prayReq: 1  },
  { name: "Ourg Bones",            shards: 112, note: "Ourgs (in-game tested)",  prayReq: 1  },
  { name: "Superior Dragon Bones", shards: 121, note: "Requires 70 Prayer",      prayReq: 70 },
];

function PrayerTool() {
  const [currentLevel, setCurrentLevel] = useState(60);
  const [targetLevel, setTargetLevel] = useState(99);
  const [wineType, setWineType] = useState("sunfire");
  const [leaguesMulti, setLeaguesMulti] = useState(1);
  const [boneKey, setBoneKey] = useState("Superior Dragon Bones");

  const safeTarget = Math.max(currentLevel + 1, Math.min(99, targetLevel));
  const bone = BONE_TYPES.find(b => b.name === boneKey) ?? BONE_TYPES[BONE_TYPES.length - 1];

  const xpNeeded = Math.max(0, xpForLevel(safeTarget) - xpForLevel(currentLevel));
  const xpPerShard = (wineType === "sunfire" ? 6 : 5) * leaguesMulti;
  const xpPerBone = xpPerShard * bone.shards;

  const shardsNeeded = Math.ceil(xpNeeded / xpPerShard);
  const bonesNeeded = Math.ceil(shardsNeeded / bone.shards);
  const winesNeeded = Math.ceil(shardsNeeded / 400);

  const currentXp = xpForLevel(currentLevel);
  const targetXp = xpForLevel(safeTarget);
  const progressPct = Math.min(100, Math.round((currentXp / targetXp) * 100));

  // Sort bones by shards descending for the dropdown — most common use case is picking best bones
  const sortedBones = [...BONE_TYPES].sort((a, b) => b.shards - a.shards);

  return (
    <>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">Current Prayer Level</span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Spinner value={currentLevel} onChange={v => { setCurrentLevel(v); if (v >= targetLevel) setTargetLevel(Math.min(99, v+1)); }} min={1} max={98} />
            <input type="range" min={1} max={98} value={currentLevel} onChange={e => { const v=Number(e.target.value); setCurrentLevel(v); if(v>=targetLevel) setTargetLevel(Math.min(99,v+1)); }} />
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Target Prayer Level</span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Spinner value={safeTarget} onChange={v => setTargetLevel(Math.max(currentLevel+1, v))} min={Math.min(99,currentLevel+1)} max={99} />
            <input type="range" min={Math.min(99,currentLevel+1)} max={99} value={safeTarget} onChange={e => setTargetLevel(Number(e.target.value))} />
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Bone Type</span>
          <select
            className={`leagues-select active-league`}
            style={{ height: "auto", padding: "7px 28px 7px 10px", fontSize: "0.72rem" }}
            value={boneKey}
            onChange={e => setBoneKey(e.target.value)}
          >
            {sortedBones.map(b => (
              <option key={b.name} value={b.name}>
                {b.name} ({b.shards} shards){b.prayReq > 1 ? ` — 70 Prayer` : ""}
              </option>
            ))}
          </select>
          <div style={{ fontFamily:"'Crimson Text',serif", fontSize:"0.72rem", color:"#b89a6a", marginTop:2 }}>
            {bone.shards} shards/bone · {bone.note}
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Wine Type at Bowl</span>
          <div className="seg-group">
            <button className={`seg-btn ${wineType==="blessed"?"active":""}`} onClick={()=>setWineType("blessed")}>🍷 Blessed (5 XP/shard)</button>
            <button className={`seg-btn ${wineType==="sunfire"?"active":""}`} onClick={()=>setWineType("sunfire")}>☀️ Sunfire (6 XP/shard)</button>
          </div>
        </div>
        <LeaguesSelect value={leaguesMulti} onChange={setLeaguesMulti} />
      </div>

      <div className="xp-bar-wrap">
        <div className="xp-bar-label">Progress to Goal — Level {currentLevel} → {safeTarget}</div>
        <div className="xp-bar-bg"><div className="xp-bar-fill" style={{width:`${progressPct}%`}} /></div>
        <div className="xp-bar-text">{currentXp.toLocaleString()} / {targetXp.toLocaleString()} XP ({progressPct}%)</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">XP Needed</div>
          <div className="stat-card-value">{xpNeeded.toLocaleString()}<span className="stat-card-unit">XP</span></div>
          <div className="stat-card-sub">{leaguesMulti>1?`At ${leaguesMulti}× multiplier`:"Standard rates"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">XP per Shard</div>
          <div className="stat-card-value">{xpPerShard}<span className="stat-card-unit">XP</span></div>
          <div className="stat-card-sub">{wineType==="sunfire"?"6":"5"} base{leaguesMulti>1?` × ${leaguesMulti}`:""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">XP per Bone</div>
          <div className="stat-card-value">{xpPerBone.toLocaleString()}<span className="stat-card-unit">XP</span></div>
          <div className="stat-card-sub">{bone.shards} shards × {xpPerShard} XP/shard</div>
        </div>
      </div>

      <div className="stat-grid" style={{paddingTop:12}}>
        <div className="stat-card" style={{border:"1px solid #8b6914"}}>
          <div className="stat-card-label">Blessed {bone.name} Needed</div>
          <div className="stat-card-value" style={{fontSize:"1.8rem"}}>{bonesNeeded.toLocaleString()}</div>
          <div className="stat-card-sub">{bone.shards} shards each → {(bonesNeeded * bone.shards).toLocaleString()} total shards</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Bone Shards Needed</div>
          <div className="stat-card-value">{shardsNeeded.toLocaleString()}</div>
          <div className="stat-card-sub">{bonesNeeded.toLocaleString()} bones × {bone.shards}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{wineType==="sunfire"?"Jugs of Sunfire Wine":"Jugs of Blessed Wine"}</div>
          <div className="stat-card-value">{winesNeeded.toLocaleString()}</div>
          <div className="stat-card-sub">1 jug per 400 shards sacrificed</div>
        </div>
      </div>

      {/* Bone comparison mini-table */}
      <div className="table-wrap" style={{marginTop:20}}>
        <table>
          <thead>
            <tr>
              <th>Bone Type</th>
              <th>Shards/Bone</th>
              <th>XP/Bone{leaguesMulti>1?` (${leaguesMulti}×)`:""}</th>
              <th>Bones Needed</th>
              <th>vs {bone.name}</th>
            </tr>
          </thead>
          <tbody>
            {sortedBones.map(b => {
              const bXpPerBone = xpPerShard * b.shards;
              const bBonesNeeded = Math.ceil(shardsNeeded / b.shards);
              const diff = bBonesNeeded - bonesNeeded;
              const isSelected = b.name === boneKey;
              return (
                <tr key={b.name} className={isSelected ? "top-row" : ""} style={{cursor:"pointer"}} onClick={() => setBoneKey(b.name)}>
                  <td>
                    <div className="name-cell" style={{gap:6}}>
                      {isSelected && <span style={{color:"#f5c842",fontSize:"0.7rem"}}>▶</span>}
                      <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.76rem",color:isSelected?"#f5c842":"#e8d5a3"}}>{b.name}</span>
                      {b.prayReq > 1 && <span style={{fontSize:"0.55rem",color:"#8b7355"}}>70 PRY</span>}
                    </div>
                  </td>
                  <td style={{color:"#c9a84c"}}>{b.shards}</td>
                  <td style={{color:isSelected?"#f5c842":"#c9a84c",fontWeight:isSelected?600:400}}>{bXpPerBone.toLocaleString()}</td>
                  <td style={{color:isSelected?"#f5c842":"#c9a84c",fontWeight:isSelected?600:400}}>{bBonesNeeded.toLocaleString()}</td>
                  <td style={{color: diff===0?"#b89a6a": diff<0?"#7ec842":"#cc6644", fontFamily:"'Cinzel',serif", fontSize:"0.78rem"}}>
                    {diff === 0 ? "—" : diff < 0 ? `${Math.abs(diff).toLocaleString()} fewer` : `+${diff.toLocaleString()} more`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Level milestone breakdown */}
      <div style={{margin:"16px 28px 0", fontSize:"0.6rem", letterSpacing:"0.12em", color:"#8b7355", textTransform:"uppercase"}}>
        Level Milestone Breakdown — {bone.name}
      </div>
      <div className="table-wrap" style={{marginTop:8}}>
        <table>
          <thead>
            <tr>
              <th>Milestone</th>
              <th>XP Required</th>
              <th>Bones Needed</th>
              <th>Shards Needed</th>
              <th>Wines Needed</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({length: safeTarget - currentLevel}, (_, i) => currentLevel + 1 + i)
              .filter((_, i) => i === 0 || (currentLevel + 1 + i - 1) % Math.max(1, Math.floor((safeTarget - currentLevel) / 8)) === 0 || currentLevel + 1 + i === safeTarget)
              .slice(0, 10)
              .map(lvl => {
                const xp = Math.max(0, xpForLevel(lvl) - xpForLevel(currentLevel));
                const shards = Math.ceil(xp / xpPerShard);
                const bones = Math.ceil(shards / bone.shards);
                const wines = Math.ceil(shards / 400);
                return (
                  <tr key={lvl} className={lvl===safeTarget?"top-row":""}>
                    <td style={{fontFamily:"'Cinzel',serif",fontSize:"0.78rem",color:lvl===safeTarget?"#f5c842":"#e8d5a3"}}>
                      Level {lvl}{lvl===safeTarget?" 🎯":""}
                    </td>
                    <td>{xp.toLocaleString()}</td>
                    <td style={{color:lvl===safeTarget?"#f5c842":"#c9a84c",fontWeight:lvl===safeTarget?600:400}}>{bones.toLocaleString()}</td>
                    <td>{shards.toLocaleString()}</td>
                    <td>{wines.toLocaleString()}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="footer-note" style={{marginTop:8}}>
        Shard counts from OSRS Wiki (Module:Prayer/Blessed_Bone_Shards). Ourg bones corrected to 112 via in-game testing (wiki talk, Feb 2026).
        Blessed wine: 5 XP/shard · Sunfire wine: 6 XP/shard · 1 jug per 400 shards. Leagues multiplier reduces bones needed proportionally.
        Click any row in the comparison table to switch bone type.
      </div>
    </>
  );
}

// ─── THIEVING TOOL ────────────────────────────────────────────────────────────
// Elf pickpocket data (OSRS Wiki):
// - Success rate: 2.4% at lvl 1 → 39.2% at lvl 99, linear (Mod Ash)
// - +10% with Thieving cape, +10% with hard Ardougne diary (max 47.4% at 99 w/ both)
// - 353.3 XP per successful pickpocket
// - Larcenist: 100% success rate, auto-repickpocket, 3,000 pickpockets/hr (wiki)
// - Crystal shards: 3% chance per pickpocket + 1/1024 enhanced seed (150 shards each)
//   = ~29 direct shards + ~150 seed shards (1 seed/hr at 512 pph) = ~179/hr standard
// - With Larcenist: 3000 pph × 3% = 90 direct shards + ~3 seeds × 150 = ~540 shards/hr
// - Shards for crafting: crystal armour set ~400 shards, weapon frames etc.
// - Shards needed for 99 crafting via crystal equipment is variable; we model shards needed

const THIEVING_XP = [0,83,174,276,388,512,650,801,969,1154,1358,1584,1833,2107,2411,2746,3115,3523,3973,4470,5018,5624,6291,7028,7842,8740,9730,10824,12031,13363,14833,16456,18247,20224,22406,24815,27473,30408,33648,37224,41171,45529,50339,55649,61512,67983,75127,83014,91721,101333,112012,123660,136594,150872,166636,184040,203254,224466,247886,273742,302288,333804,368599,407015,449428,496254,547953,605032,667991,737627,814445,899257,992895,1096278,1210421,1336443,1475581,1629200,1798808,1986068,2192818,2421087,2673114,2951373,3258594,3597792,3972294,4385776,4842295,5346332,5902831,6517253,7195629,7944614,8771558,9684577,10692629,11805606,13034431];

// Crystal shards needed per craft XP source (approx, used for shard goal calculator)
// Crystal armour: body=400, legs=300, helm=150 = 850 for set = 10,000 crafting XP approx per shard
// We model: shards → 5 crafting XP per shard used in crystal tools/armour context (wiki approximation)
const SHARD_CRAFTING_XP = 5; // XP per shard used for crystal items (rough approximation)
const SHARD_SMITHING_XP = 3; // XP per shard (crystal tools smithing route)

function getElfPickpocketsPerHour(thievingLevel, larcenist, thievingCape, ardyDiary) {
  if (larcenist) return 3000;
  // Base success: linear from 2.4% (lvl1) to 39.2% (lvl99) — Mod Ash confirmed
  const baseSuccess = 0.024 + (thievingLevel - 1) * (0.392 - 0.024) / 98;
  const bonus = (thievingCape ? 0.1 : 0) + (ardyDiary ? 0.1 : 0);
  const successRate = Math.min(1, baseSuccess + bonus);
  // At 39.2% success, wiki says ~512 pph; linear scale from that baseline
  return Math.round(512 * (successRate / 0.392));
}

function getShardsPerHour(pph, larcenist) {
  const directShards = pph * 0.03; // 3% chance per pickpocket
  // Enhanced seeds: 1/1024 chance (doubled with rogues); average ~1 per hr at 512 pph
  // Scale seed rate proportionally to pph
  const seedsPerHour = pph / 512;
  const shardSeedsPerHour = seedsPerHour * 150;
  // Larcenist 10× loot: direct shards ×10, seeds also ×10 (but seeds already give 150 each)
  if (larcenist) {
    return Math.round(directShards * 10 + shardSeedsPerHour * 10);
  }
  return Math.round(directShards + shardSeedsPerHour);
}

const THIEVING_XP_PER_PICKPOCKET = 353.3;

// Shard targets for crafting/smithing 99 and leagues thresholds
// Crystal armour set + weapons consume ~2,000+ shards for meaningful XP
// Approx: 1 shard = 5 crafting XP (crystal tool frames etc.)
// For 99 crafting from 1: ~13M XP needed / 5 = ~2.6M shards (extreme, not realistic)
// In practice via crystal seeds → 150 shards → craft crystal bow (78 crafting XP each) = 0.52 XP/shard
// We use a practical model: shards × 78 XP / 150 shards per seed conversion
// i.e. crystal bow: 150 shards + 1 crystal bow = 78 XP → 0.52 XP/shard
// For 99 crafting at 0.52 XP/shard from current level:
const SHARD_TO_CRAFT_XP = 0.52; // crafting XP per shard (crystal bow route)

const LEAGUE_XP_GOALS = [
  { label: "99", type: "level", level: 99 },
  { label: "25M XP", type: "xp", xp: 25_000_000 },
  { label: "35M XP", type: "xp", xp: 35_000_000 },
  { label: "50M XP", type: "xp", xp: 50_000_000 },
];

function ThievingTool() {
  const [thievingLevel, setThievingLevel] = useState(85);
  const [larcenist, setLarcenist] = useState(false);
  const [thievingCape, setThievingCape] = useState(false);
  const [ardyDiary, setArdyDiary] = useState(false);
  const [leaguesMulti, setLeaguesMulti] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState("thieving"); // thieving | shards

  const pph = getElfPickpocketsPerHour(thievingLevel, larcenist, thievingCape, ardyDiary);
  const thievingXpPerHour = pph * THIEVING_XP_PER_PICKPOCKET * leaguesMulti;
  const shardsPerHour = getShardsPerHour(pph, larcenist);
  const craftXpPerHour = shardsPerHour * SHARD_TO_CRAFT_XP * leaguesMulti;

  const currentThievingXp = xpForSkillLevel(THIEVING_XP, thievingLevel);
  const currentCraftXp = 0; // user doesn't set crafting level here; show shards needed to reach goals

  const thievingGoals = LEAGUE_XP_GOALS.map(g => {
    const targetXp = g.type === "level" ? xpForSkillLevel(THIEVING_XP, 99) : g.xp;
    const xpLeft = Math.max(0, targetXp - currentThievingXp);
    const hoursNeeded = thievingXpPerHour > 0 ? xpLeft / thievingXpPerHour : null;
    const pickpocksNeeded = xpLeft > 0 ? Math.ceil(xpLeft / (THIEVING_XP_PER_PICKPOCKET * leaguesMulti)) : 0;
    return { ...g, xpLeft, hoursNeeded, pickpocksNeeded };
  });

  const shardGoals = LEAGUE_XP_GOALS.map(g => {
    const targetXp = g.type === "level" ? xpForSkillLevel(CRAFTING_XP, 99) : g.xp; // use generic XP table for crafting
    const xpNeeded = targetXp; // from 0 since we don't track crafting level here
    const shardsNeeded = craftXpPerHour > 0 ? Math.ceil(xpNeeded / (SHARD_TO_CRAFT_XP * leaguesMulti)) : null;
    const hoursNeeded = shardsPerHour > 0 && shardsNeeded ? shardsNeeded / shardsPerHour : null;
    return { ...g, shardsNeeded, hoursNeeded };
  });

  return (
    <>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">Thieving Level</span>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <Spinner value={thievingLevel} onChange={setThievingLevel} min={85} max={99} />
            <input type="range" min={85} max={99} value={thievingLevel} onChange={e=>setThievingLevel(Number(e.target.value))} />
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Larcenist Relic (T5)</span>
          <button className={`toggle-btn ${larcenist?"on":""}`} onClick={()=>setLarcenist(l=>!l)}>
            {larcenist?"✓ Larcenist ON":"✗ No Larcenist"}
          </button>
          {larcenist && <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.72rem",color:"#f5c842",marginTop:2}}>100% success · 3,000 pph · 10× loot</div>}
        </div>
        {!larcenist && <>
          <div className="control-group">
            <span className="control-label">Thieving Cape</span>
            <button className={`toggle-btn ${thievingCape?"on":""}`} onClick={()=>setThievingCape(c=>!c)}>{thievingCape?"✓ Wearing":"✗ Not Wearing"}</button>
          </div>
          <div className="control-group">
            <span className="control-label">Hard Ardougne Diary</span>
            <button className={`toggle-btn ${ardyDiary?"on":""}`} onClick={()=>setArdyDiary(d=>!d)}>{ardyDiary?"✓ Completed":"✗ Not Done"}</button>
          </div>
        </>}
        <LeaguesSelect value={leaguesMulti} onChange={setLeaguesMulti} />
      </div>

      {/* Sub-tab switcher */}
      <div style={{display:"flex",borderBottom:"1px solid #2a1f0a",background:"#0f0f0f"}}>
        {[["thieving","🗝 Thieving XP"],["shards","💎 Crystal Shards for Crafting"]].map(([id,label])=>(
          <button key={id} className={`seg-btn ${activeSubTab===id?"active":""}`}
            style={{padding:"10px 20px",borderRight:"1px solid #2a1f0a",borderRadius:0,fontSize:"0.7rem"}}
            onClick={()=>setActiveSubTab(id)}>{label}</button>
        ))}
      </div>

      {activeSubTab === "thieving" && <>
        <div className="stat-grid">
          <div className="stat-card" style={larcenist?{border:"1px solid #4a7a1a"}:{}}>
            <div className="stat-card-label">Pickpockets / Hour{larcenist?" 🗝":""}</div>
            <div className="stat-card-value" style={larcenist?{color:"#7ec842"}:{}}>{pph.toLocaleString()}</div>
            <div className="stat-card-sub">{larcenist?"Larcenist auto-repickpocket":`~${Math.round(pph/512*39.2)}% success rate`}</div>
          </div>
          <div className="stat-card" style={leaguesMulti>1?{border:"1px solid #8b6914"}:{}}>
            <div className="stat-card-label">Thieving XP / Hour{leaguesMulti>1?` (${leaguesMulti}×)`:""}</div>
            <div className="stat-card-value" style={{color:"#f5c842"}}>{Math.round(thievingXpPerHour).toLocaleString()}</div>
            <div className="stat-card-sub">{pph.toLocaleString()} × 353.3 XP{leaguesMulti>1?` × ${leaguesMulti}`:""}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Current Thieving XP</div>
            <div className="stat-card-value">{currentThievingXp.toLocaleString()}</div>
            <div className="stat-card-sub">Level {thievingLevel}</div>
          </div>
        </div>

        <div style={{margin:"16px 28px 0",fontSize:"0.6rem",letterSpacing:"0.12em",color:"#8b7355",textTransform:"uppercase",marginBottom:8}}>
          Time to Reach Goals — Elf Pickpocketing
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Goal</th><th>XP Needed</th><th>Pickpockets</th><th>Time</th></tr></thead>
            <tbody>
              {thievingGoals.map(g => {
                const done = g.xpLeft === 0;
                return (
                  <tr key={g.label} className={g.label==="99"?"top-row":""}>
                    <td style={{fontFamily:"'Cinzel',serif",fontSize:"0.78rem",color:g.label==="99"?"#f5c842":"#e8d5a3"}}>{g.label}</td>
                    <td style={{color:done?"#7ec842":"#c9a84c"}}>{done?"✓ Done":g.xpLeft.toLocaleString()}</td>
                    <td>{done?"—":g.pickpocksNeeded.toLocaleString()}</td>
                    <td style={{fontFamily:"'Cinzel',serif",fontSize:"0.82rem",color:done?"#7ec842":"#f5c842"}}>
                      {done?"Complete":g.hoursNeeded!==null?(g.hoursNeeded<1?`${Math.ceil(g.hoursNeeded*60)}m`:`${g.hoursNeeded.toFixed(1)}h`):"—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="footer-note" style={{marginTop:8}}>
          Elf pickpocket rate: Mod Ash formula (2.4%→39.2% at lvl 1→99). Larcenist: 3,000 pph (OSRS Wiki Leagues guide). 353.3 XP per successful pickpocket.
        </div>
      </>}

      {activeSubTab === "shards" && <>
        <div className="stat-grid">
          <div className="stat-card" style={larcenist?{border:"1px solid #4a7a1a"}:{}}>
            <div className="stat-card-label">Crystal Shards / Hour{larcenist?" 🗝":""}</div>
            <div className="stat-card-value" style={larcenist?{color:"#7ec842"}:{color:"#f5c842"}}>{shardsPerHour.toLocaleString()}</div>
            <div className="stat-card-sub">{larcenist?"Direct shards ×10 + seeds ×10":"~3% per ppt + 1 seed/hr (150 shards)"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Crafting XP / Hour (via shards){leaguesMulti>1?` (${leaguesMulti}×)`:""}</div>
            <div className="stat-card-value">{Math.round(craftXpPerHour).toLocaleString()}</div>
            <div className="stat-card-sub">{shardsPerHour} shards × 0.52 XP/shard{leaguesMulti>1?` × ${leaguesMulti}`:""}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Shards for 1 Hour Session</div>
            <div className="stat-card-value">{shardsPerHour.toLocaleString()}</div>
            <div className="stat-card-sub">Sellable or useable for crystal items</div>
          </div>
        </div>

        <div style={{margin:"16px 28px 0",fontSize:"0.6rem",letterSpacing:"0.12em",color:"#8b7355",textTransform:"uppercase",marginBottom:8}}>
          Shards Needed & Time for Crafting/Smithing Goals
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Goal</th><th>Total XP</th><th>Shards Needed</th><th>Time Pickpocketing</th></tr></thead>
            <tbody>
              {shardGoals.map(g => (
                <tr key={g.label} className={g.label==="99"?"top-row":""}>
                  <td style={{fontFamily:"'Cinzel',serif",fontSize:"0.78rem",color:g.label==="99"?"#f5c842":"#e8d5a3"}}>{g.label}</td>
                  <td style={{color:"#c9a84c"}}>{(g.type==="level"?xpForSkillLevel(CRAFTING_XP,99):g.xp).toLocaleString()}</td>
                  <td style={{color:"#f5c842",fontFamily:"'Cinzel',serif",fontSize:"0.82rem"}}>{g.shardsNeeded?.toLocaleString()??""}</td>
                  <td style={{color:"#f5c842",fontFamily:"'Cinzel',serif",fontSize:"0.82rem"}}>
                    {g.hoursNeeded!=null?(g.hoursNeeded<1?`${Math.ceil(g.hoursNeeded*60)}m`:`${g.hoursNeeded.toFixed(1)}h`):"—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="footer-note" style={{marginTop:8}}>
          Shard rate: 3% per pickpocket direct + ~1 enhanced seed/hr (150 shards each). Larcenist: 10× loot = 10× direct shards + 10× seeds.
          Crystal bow crafting route: ~0.52 crafting XP per shard (150 shards → 1 crystal bow → 78 XP). Leagues multiplier applies to XP only, not shard count.
        </div>
      </>}
    </>
  );
}

// ─── ORE STALL TOOL ───────────────────────────────────────────────────────────
// TzHaar ore stall: requires 82 Thieving + Fire Cape (inner Mor Ul Rek)
// Ore drop table (wiki Shop Counter (ore)): iron, coal, silver, gold, mithril, adamantite, runite
// Larcenist: auto-re-steal, stall never depletes, 10× loot, noted
// Stall steals: wiki states 3,000 stall steals/hr with Larcenist
// Without Larcenist: ~1 steal per ~3 ticks (1.8s) = ~2000/hr but stall depletes after 1 item
//   (no Larcenist = need to wait for respawn ~105s) → effectively ~34/hr without larcenist, impractical
// We model: with Larcenist only for ore stall (tool notes this)
//
// Transmutation chain (Alchemic Divergence relic, Tier 4):
//   Copper → Tin → Iron → Silver → Coal → Gold → Mithril → Adamantite → Runite
//   10 noted ores per cast, 1 tier per cast, every 5 ticks (3s per cast)
//   Max sell: 10 ores per tick to shop, but Cam Torum (Mistrock) sells rune ore at 2,240 gp each
//
// Ore stall drop weights (approximate from wiki, equal weight each type):
// iron(1), coal(1), silver(1), gold(1), mithril(1), adamantite(1), runite(1) — 7 types equal weight
// Average ore value without transmutation: average GE prices (static approximation)

const ORE_CHAIN = [
  { name: "Copper",     gpEach: 3,    tokkul: 1   },
  { name: "Tin",        gpEach: 4,    tokkul: 1   },
  { name: "Iron",       gpEach: 60,   tokkul: 25  },
  { name: "Silver",     gpEach: 90,   tokkul: 38  },
  { name: "Coal",       gpEach: 140,  tokkul: 58  },
  { name: "Gold",       gpEach: 280,  tokkul: 115 },
  { name: "Mithril",    gpEach: 240,  tokkul: 100 },
  { name: "Adamantite", gpEach: 1100, tokkul: 460 },
  { name: "Runite",     gpEach: 2240, tokkul: 1120 }, // Mistrock sell price
];

// What ores the stall drops: iron, coal, silver, gold, mithril, adamantite, runite — 7 types equal weight
const STALL_ORE_DROPS = ["Iron","Coal","Silver","Gold","Mithril","Adamantite","Runite"];
const AVG_ORE_GP = Math.round(STALL_ORE_DROPS.map(n => ORE_CHAIN.find(o=>o.name===n).gpEach).reduce((a,b)=>a+b,0) / STALL_ORE_DROPS.length);
const AVG_ORE_TOKKUL = Math.round(STALL_ORE_DROPS.map(n => ORE_CHAIN.find(o=>o.name===n).tokkul).reduce((a,b)=>a+b,0) / STALL_ORE_DROPS.length);

// Transmutation: 10 ores up 1 tier per 5 ticks (3s), so 20 tiers per minute = 1200 tiers/hr
// Each ore needs (9 - startTierIndex) casts to reach runite
// Stall ores are mixed; we model average starting tier = index of "Iron" = 2
// Iron → Runite: 7 tiers × 10 ores per cast = 70 ores transmuted per cast sequence
// Time per 10-ore stack from Iron to Rune: 7 casts × 3s = 21s
// Sell rate: 10 ores per tick to shop = effectively limited by transmute speed
// With Larcenist 10× loot and noted: receiving ~10× ores, all noted, can transmute in bulk

const STALL_PPH_LARCENIST = 3000; // wiki
const ORE_PER_STEAL_LARCENIST = 10; // 10× loot with Larcenist
const TRANSMUTE_TICKS_PER_CAST = 5; // 5 ticks = 3s
const TRANSMUTE_ORE_PER_CAST = 10; // 10 noted ores per cast
const TICKS_PER_HOUR = 6000; // 6000 game ticks/hr

// Steps from each stall ore type to runite
function stepsToRunite(oreName) {
  const chain = ["Copper","Tin","Iron","Silver","Coal","Gold","Mithril","Adamantite","Runite"];
  const idx = chain.indexOf(oreName);
  return idx === -1 ? 0 : chain.length - 1 - idx;
}

// Transmute rate: given notes of a single ore type, how many runite ore per hour?
// Each cast: 10 ores → 10 of next tier, every 3s. To get from ore X to runite: stepsToRunite(X) casts per 10 ores
// runitePerHour = (3600 / (stepsToRunite * 3)) * 10   [if unlimited ores]
// We cap by stall input rate with larcenist
function getOreTool_larcenist(desiredGp, transmute) {
  // Ores received per hour from stall with Larcenist (all types, noted)
  const oresPerHour = STALL_PPH_LARCENIST * ORE_PER_STEAL_LARCENIST;

  if (!transmute) {
    // Sell all ores directly at face value
    const gpPerHour = oresPerHour * AVG_ORE_GP;
    const hoursNeeded = desiredGp / gpPerHour;
    const stealsNeeded = Math.ceil(desiredGp / (AVG_ORE_GP * ORE_PER_STEAL_LARCENIST));
    return { gpPerHour, hoursNeeded, stealsNeeded, method: "Direct sell", note: `Avg ${AVG_ORE_GP} gp/ore across all stall types` };
  } else {
    // Transmute all to runite, sell at 2,240 gp each
    // Average stall ore needs ~5.7 transmutation steps to reach runite (avg of Iron→7 steps, Coal→6, etc.)
    const avgSteps = Math.round(STALL_ORE_DROPS.map(n => stepsToRunite(n)).reduce((a,b)=>a+b,0) / STALL_ORE_DROPS.length);
    // Transmute throughput: casts per hour = TICKS_PER_HOUR / TRANSMUTE_TICKS_PER_CAST = 1200
    const castsPerHour = TICKS_PER_HOUR / TRANSMUTE_TICKS_PER_CAST;
    // Each cast converts 10 ores one tier — to produce one runite requires avgSteps casts per 10 ores
    const runitePerHour = Math.round((castsPerHour / avgSteps) * TRANSMUTE_ORE_PER_CAST);
    const gpPerHour = runitePerHour * 2240;
    const hoursNeeded = desiredGp / gpPerHour;
    const stealsNeeded = Math.ceil(hoursNeeded * STALL_PPH_LARCENIST);
    return { gpPerHour, hoursNeeded, stealsNeeded, runitePerHour, avgSteps, method: "Transmute → Runite", note: `Avg ${avgSteps} transmute steps/ore → Runite @ 2,240 gp` };
  }
}

function OreStallTool() {
  const [desiredGp, setDesiredGp] = useState(1000000);
  const [transmute, setTransmute] = useState(false);
  const [desiredGpInput, setDesiredGpInput] = useState("1,000,000");

  const directResult = getOreTool_larcenist(desiredGp, false);
  const transmuteResult = getOreTool_larcenist(desiredGp, true);

  const formatGp = (n) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : n.toLocaleString();
  const formatTime = (h) => h < 1/60 ? `<1m` : h < 1 ? `${Math.ceil(h*60)}m` : `${h.toFixed(2)}h`;

  return (
    <>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">Desired Gold (GP)</span>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <input
              className="spinner-input"
              style={{width:120,borderLeft:"1px solid #3a2a0a",borderRight:"1px solid #3a2a0a",border:"1px solid #3a2a0a",borderRadius:4,height:32,fontSize:"0.82rem"}}
              value={desiredGpInput}
              onChange={e => {
                const raw = e.target.value.replace(/,/g,"");
                setDesiredGpInput(e.target.value);
                const n = parseInt(raw);
                if (!isNaN(n) && n > 0) setDesiredGp(n);
              }}
              onBlur={() => setDesiredGpInput(desiredGp.toLocaleString())}
            />
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[100_000,500_000,1_000_000,5_000_000,10_000_000,50_000_000].map(v=>(
                <button key={v} className={`seg-btn ${desiredGp===v?"active":""}`} onClick={()=>{setDesiredGp(v);setDesiredGpInput(v.toLocaleString());}}>
                  {formatGp(v)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Note</span>
          <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.82rem",color:"#b89a6a",maxWidth:280}}>
            Requires <strong style={{color:"#f5c842"}}>Larcenist</strong> relic + Fire Cape (inner Mor Ul Rek). Transmutation requires <strong style={{color:"#f5c842"}}>Alchemic Divergence</strong> (Tier 4 relic).
          </div>
        </div>
      </div>

      {/* Side by side comparison */}
      <div style={{display:"flex",gap:16,padding:"20px 28px 0",flexWrap:"wrap"}}>
        {[
          {result: directResult, color: "#8b6914", icon: "💰", title: "Direct Sell"},
          {result: transmuteResult, color: "#4a7a1a", icon: "⚗️", title: "Transmute → Runite"},
        ].map(({result, color, icon, title}) => (
          <div key={title} style={{flex:1,minWidth:260,background:"#1a1200",border:`1px solid ${color}`,borderRadius:6,padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:"1.3rem"}}>{icon}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.85rem",fontWeight:600,color:"#f5c842"}}>{title}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>GP / Hour</div>
                <div style={{fontSize:"1.4rem",fontWeight:700,fontFamily:"'Cinzel',serif",color:"#f5c842"}}>{formatGp(result.gpPerHour)}</div>
              </div>
              <div>
                <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>Time for {formatGp(desiredGp)} GP</div>
                <div style={{fontSize:"1.2rem",fontWeight:600,fontFamily:"'Cinzel',serif",color:"#c9a84c"}}>{formatTime(result.hoursNeeded)}</div>
              </div>
              <div>
                <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>Stall Steals Needed</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",color:"#b89a6a"}}>{result.stealsNeeded.toLocaleString()}</div>
              </div>
              {result.runitePerHour && <div>
                <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>Runite Ore / Hour</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",color:"#7ec842"}}>{result.runitePerHour.toLocaleString()}</div>
              </div>}
              <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.78rem",color:"#8b7355",marginTop:4,borderTop:"1px solid #2a1f0a",paddingTop:8}}>{result.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Transmute chain reference */}
      <div style={{margin:"16px 28px 0",background:"#1a1200",border:"1px solid #3a2a0a",borderRadius:6,padding:"14px 18px"}}>
        <div style={{fontSize:"0.6rem",letterSpacing:"0.12em",color:"#8b7355",textTransform:"uppercase",marginBottom:10}}>Transmutation Chain — Steps to Runite</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"2px 0",alignItems:"center",fontFamily:"'Crimson Text',serif",fontSize:"0.88rem",color:"#c9a84c"}}>
          {["Copper","Tin","Iron","Silver","Coal","Gold","Mithril","Adamantite","Runite"].map((ore,i,arr)=>(
            <span key={ore} style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{
                color: STALL_ORE_DROPS.includes(ore) ? "#f5c842" : "#5a4a2a",
                fontFamily:"'Cinzel',serif",fontSize:"0.72rem",
                padding:"2px 8px",background:STALL_ORE_DROPS.includes(ore)?"#2d1f00":"#111",
                borderRadius:3,border:`1px solid ${STALL_ORE_DROPS.includes(ore)?"#3a2a0a":"#1e1600"}`
              }}>{ore}</span>
              {i < arr.length-1 && <span style={{color:"#3a2a0a",margin:"0 4px"}}>→</span>}
            </span>
          ))}
        </div>
        <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.75rem",color:"#8b7355",marginTop:8}}>
          Highlighted ores are dropped by the ore stall. Alchemic Divergence: 10 noted ores per cast, 1 tier per 5 ticks (3s). Sell runite at Mistrock Mining Supplies: 2,240 gp each.
        </div>
      </div>

      <div className="footer-note" style={{marginTop:16}}>
        Larcenist: 3,000 stall steals/hr × 10× loot = 30,000 ores/hr (OSRS Wiki). Transmutation: 10 ores/cast every 5 ticks = 1,200 casts/hr.
        Avg {stepsToRunite("Iron")} steps from Iron → Runite. Direct sell uses avg GE value across all stall ore types.
      </div>
    </>
  );
}

// ─── LEAGUES TASK TRACKER ─────────────────────────────────────────────────────
// Uses Claude API to fetch wiki task page data for a given username
// WikiSync API is wiki-internal only (per their policy) — we use Claude to parse the wiki's
// public Leagues task page instead, which shows task completion when a username is entered.

const REGIONS = ["Asgarnia","Desert","Fremennik","Kandarin","Karamja","Kourend","Misthalin","Morytania","Tirannwn","Varlamore","Wilderness"];
const RELICS = {
  1: ["Endless Harvest","Barbarian Gathering","Abundance"],
  2: ["Hotfoot","Friendly Forager","Woodsman"],
  3: ["Bank Heist","Evil Eye","Bank Heist"],
  4: ["Butler's Bell","Nature's Accord","Alchemic Divergence"],
  5: ["Larcenist","Soul Harvest","Flow State"],
  6: ["Grimoire","Culling Spree","Executioner"],
  7: ["Minion","Reloaded","Minion"],
  8: ["Reloaded","Flask of Fortitude","Two-Tick Everything"],
};

// Hardcoded top task pool for Leagues 6 with estimated points and time
// Source: OSRS Wiki Demonic Pacts League tasks page (curated top high-value tasks)
const TOP_TASKS = [
  { name:"Complete the Fortis Colosseum", points:10000, estMinutes:180, regions:["Varlamore"], relics:[] },
  { name:"Reach 50M XP in any skill", points:5000, estMinutes:300, regions:[], relics:[] },
  { name:"Reach 50M Thieving XP", points:5000, estMinutes:120, regions:["Tirannwn"], relics:["Larcenist"] },
  { name:"Reach 50M Fishing XP", points:5000, estMinutes:180, regions:["Karamja"], relics:["Endless Harvest"] },
  { name:"Reach 50M Cooking XP", points:5000, estMinutes:120, regions:[], relics:[] },
  { name:"Reach 50M Crafting XP", points:5000, estMinutes:90, regions:["Tirannwn"], relics:["Larcenist"] },
  { name:"Reach 50M Prayer XP", points:5000, estMinutes:240, regions:[], relics:[] },
  { name:"Complete the Inferno", points:8000, estMinutes:240, regions:["Asgarnia"], relics:[] },
  { name:"Kill the Whisperer", points:3000, estMinutes:60, regions:["Desert"], relics:[] },
  { name:"Kill the Duke Sucellus", points:3000, estMinutes:60, regions:["Kourend"], relics:[] },
  { name:"Kill the Leviathan", points:3000, estMinutes:90, regions:["Desert"], relics:[] },
  { name:"Kill the Vardorvis", points:3000, estMinutes:60, regions:["Desert"], relics:[] },
  { name:"Pickpocket an Elf", points:1500, estMinutes:5, regions:["Tirannwn"], relics:[] },
  { name:"Steal from TzHaar ore stall", points:1000, estMinutes:5, regions:["Asgarnia"], relics:["Larcenist"] },
  { name:"Obtain 1,000 crystal shards", points:2000, estMinutes:30, regions:["Tirannwn"], relics:[] },
  { name:"Obtain an Enhanced crystal teleport seed", points:2500, estMinutes:60, regions:["Tirannwn"], relics:[] },
  { name:"Reach 25M XP in any skill", points:2000, estMinutes:60, regions:[], relics:[] },
  { name:"Complete 50 boss kills", points:1500, estMinutes:90, regions:[], relics:[] },
  { name:"Complete the Gauntlet", points:2000, estMinutes:30, regions:["Tirannwn"], relics:[] },
  { name:"Obtain a crystal weapon", points:1500, estMinutes:20, regions:["Tirannwn"], relics:[] },
  { name:"Achieve 99 in any skill", points:3000, estMinutes:120, regions:[], relics:[] },
  { name:"Complete 5 elite clue scrolls", points:2000, estMinutes:180, regions:[], relics:["Larcenist"] },
  { name:"Reach 35M XP in any skill", points:3000, estMinutes:180, regions:[], relics:[] },
  { name:"Kill Zulrah 50 times", points:2500, estMinutes:120, regions:["Tirannwn"], relics:[] },
  { name:"Obtain a Zenyte shard", points:2000, estMinutes:120, regions:["Karamja"], relics:[] },
];

function LeaguesTaskTool() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [wikiData, setWikiData] = useState(null);
  const [wikiError, setWikiError] = useState(null);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedRelics, setSelectedRelics] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [taskFilter, setTaskFilter] = useState("best");

  const toggleRegion = (r) => setSelectedRegions(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev, r]);
  const toggleTask = (name) => setCompletedTasks(prev => ({...prev, [name]: !prev[name]}));

  async function lookupWikiSync() {
    if (!username.trim()) return;
    const workerUrl = import.meta.env.VITE_WORKER_URL;
    if (!workerUrl) {
      setWikiError("Player lookup not configured yet. Set VITE_WORKER_URL to your Cloudflare Worker URL to enable.");
      return;
    }
    setLoading(true);
    setWikiError(null);
    setWikiData(null);
    try {
      // The Worker proxies to Anthropic's API with the key held server-side.
      // It expects { username } and returns the parsed JSON body directly.
      const response = await fetch(`${workerUrl}/wiki-lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Worker returned ${response.status}: ${text.slice(0, 200)}`);
      }
      const parsed = await response.json();
      setWikiData(parsed);
    } catch (e) {
      setWikiError("Failed to fetch wiki data: " + e.message);
    }
    setLoading(false);
  }

  // Score tasks by points per hour, filtered by region/relic compatibility
  const scoredTasks = TOP_TASKS
    .filter(t => {
      if (completedTasks[t.name]) return false;
      if (t.regions.length > 0 && selectedRegions.length > 0) {
        if (!t.regions.some(r => selectedRegions.includes(r))) return false;
      }
      return true;
    })
    .map(t => ({
      ...t,
      pointsPerHour: Math.round(t.points / (t.estMinutes / 60)),
      hasRelicSynergy: t.relics.length === 0 || t.relics.some(r => Object.values(selectedRelics).includes(r)),
    }))
    .sort((a, b) => (b.hasRelicSynergy ? 1 : 0) - (a.hasRelicSynergy ? 1 : 0) || b.pointsPerHour - a.pointsPerHour)
    .slice(0, 10);

  return (
    <>
      <div className="controls">
        <div className="control-group">
          <span className="control-label">RSN (WikiSync Username)</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input
              className="spinner-input"
              style={{width:160,border:"1px solid #3a2a0a",borderRadius:4,height:32,fontSize:"0.82rem",letterSpacing:"0.04em"}}
              placeholder="Player name..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookupWikiSync()}
            />
            <button className={`toggle-btn ${loading?"on":""}`} onClick={lookupWikiSync} disabled={loading}>
              {loading ? "⏳ Loading..." : "🔍 Lookup"}
            </button>
          </div>
          <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.72rem",color:"#8b7355",marginTop:2}}>
            Requires WikiSync plugin enabled in RuneLite
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Regions Unlocked</span>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,maxWidth:480}}>
            {REGIONS.map(r=>(
              <button key={r} className={`seg-btn ${selectedRegions.includes(r)?"active":""}`}
                style={{padding:"4px 10px",fontSize:"0.62rem"}} onClick={()=>toggleRegion(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Relic selectors */}
      <div style={{background:"#111",borderBottom:"1px solid #2a1f0a",padding:"12px 28px",display:"flex",flexWrap:"wrap",gap:"16px"}}>
        {[1,2,3,4,5].map(tier => (
          <div key={tier} className="control-group">
            <span className="control-label">Tier {tier} Relic</span>
            <select className={`leagues-select ${selectedRelics[tier]?"active-league":""}`}
              value={selectedRelics[tier]||""}
              onChange={e=>setSelectedRelics(prev=>({...prev,[tier]:e.target.value||undefined}))}>
              <option value="">— Not chosen</option>
              {(RELICS[tier]??[]).filter((v,i,a)=>a.indexOf(v)===i).map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* WikiSync result */}
      {wikiError && <div style={{margin:"12px 28px 0",padding:"10px 14px",background:"#2d0a0a",border:"1px solid #7a1a1a",borderRadius:4,fontFamily:"'Crimson Text',serif",fontSize:"0.85rem",color:"#cc6644"}}>{wikiError}</div>}
      {wikiData && (
        <div style={{margin:"12px 28px 0",background:"#1a1200",border:"1px solid #8b6914",borderRadius:6,padding:"12px 18px",display:"flex",flexWrap:"wrap",gap:20}}>
          <div>
            <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>WikiSync Status</div>
            <div style={{color:wikiData.found?"#7ec842":"#cc6644",fontFamily:"'Cinzel',serif",fontSize:"0.85rem",marginTop:2}}>{wikiData.found?"✓ Data Found":"✗ No Data"}</div>
          </div>
          {wikiData.completedCount != null && <div>
            <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>Tasks Done</div>
            <div style={{color:"#f5c842",fontFamily:"'Cinzel',serif",fontSize:"1rem",marginTop:2}}>{wikiData.completedCount}/{wikiData.totalTasks}</div>
          </div>}
          {wikiData.totalPoints != null && <div>
            <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:"#8b7355",textTransform:"uppercase"}}>League Points</div>
            <div style={{color:"#f5c842",fontFamily:"'Cinzel',serif",fontSize:"1rem",marginTop:2}}>{wikiData.totalPoints?.toLocaleString()}</div>
          </div>}
          {wikiData.note && <div style={{fontFamily:"'Crimson Text',serif",fontSize:"0.78rem",color:"#8b7355",flexBasis:"100%",borderTop:"1px solid #2a1f0a",paddingTop:8}}>{wikiData.note}</div>}
        </div>
      )}

      {/* Top tasks table */}
      <div style={{margin:"16px 28px 0",fontSize:"0.6rem",letterSpacing:"0.12em",color:"#8b7355",textTransform:"uppercase",marginBottom:8}}>
        Top 10 Tasks by Points/Hour — Based on Your Setup
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{width:30}}>#</th>
              <th>Task</th>
              <th>Points</th>
              <th>Est. Time</th>
              <th>Pts/Hr</th>
              <th>Done</th>
            </tr>
          </thead>
          <tbody>
            {scoredTasks.map((t, i) => (
              <tr key={t.name} className={i===0?"top-row":""}>
                <td><span className={`rank-badge ${i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"rank-other"}`}>{i+1}</span></td>
                <td>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",color:i===0?"#f5c842":"#e8d5a3"}}>{t.name}</span>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {t.regions.map(r=><span key={r} style={{fontSize:"0.55rem",background:"#2a1f0a",color:"#b89a6a",padding:"1px 5px",borderRadius:2}}>{r}</span>)}
                      {t.hasRelicSynergy && t.relics.length > 0 && t.relics.map(r=><span key={r} style={{fontSize:"0.55rem",background:"#1a2d00",color:"#7ec842",padding:"1px 5px",borderRadius:2}}>⚔ {r}</span>)}
                    </div>
                  </div>
                </td>
                <td style={{fontFamily:"'Cinzel',serif",color:"#c9a84c"}}>{t.points.toLocaleString()}</td>
                <td style={{color:"#b89a6a",fontFamily:"'Crimson Text',serif"}}>{t.estMinutes < 60 ? `~${t.estMinutes}m` : `~${(t.estMinutes/60).toFixed(1)}h`}</td>
                <td><span className="xphr-cell" style={{color:i===0?"#f5c842":i<3?"#c9a84c":"#b89a6a"}}>{t.pointsPerHour.toLocaleString()}</span></td>
                <td>
                  <button className={`toggle-btn ${completedTasks[t.name]?"on":""}`} style={{padding:"3px 8px",fontSize:"0.6rem",height:"auto"}} onClick={()=>toggleTask(t.name)}>
                    {completedTasks[t.name]?"✓":"○"}
                  </button>
                </td>
              </tr>
            ))}
            {scoredTasks.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:"center",color:"#8b7355",fontFamily:"'Crimson Text',serif",padding:"20px"}}>No tasks match your selected regions. Try adding more regions above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="footer-note" style={{marginTop:8}}>
        Task time estimates are approximations. WikiSync lookup uses Claude to search the OSRS Wiki — requires WikiSync plugin enabled in RuneLite.
        Check completed tasks to remove them from the list. Relic synergy (green) highlights tasks boosted by your chosen relics.
      </div>
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "cooking",   icon: "🍳", label: "Cooking XP" },
  { id: "karambwan", icon: "🦑", label: "Karambwan" },
  { id: "prayer",    icon: "🦴", label: "Prayer Bones" },
  { id: "thieving",  icon: "🗝", label: "Thieving" },
  { id: "orestall",  icon: "⛏", label: "Ore Stall" },
  { id: "tasks",     icon: "📋", label: "League Tasks" },
];

export default function OSRSToolkit() {
  const [activeTab, setActiveTab] = useState("cooking");
  return (
    <div className="osrs-wrap">
      <style>{GLOBAL_CSS}</style>
      <div className="tab-bar">
        <div className="tab-brand">
          <span className="tab-brand-icon">⚔️</span>
          <div>
            <div className="tab-brand-title">OSRS Toolkit</div>
            <div className="tab-brand-sub">by Diffo & Claude</div>
          </div>
        </div>
        <div className="tab-list">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab===tab.id?"active":""}`} onClick={()=>setActiveTab(tab.id)}>
              <span className="tab-icon">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>
      {activeTab === "cooking"   && <CookingTool />}
      {activeTab === "karambwan" && <KarambwanTool />}
      {activeTab === "prayer"    && <PrayerTool />}
      {activeTab === "thieving"  && <ThievingTool />}
      {activeTab === "orestall"  && <OreStallTool />}
      {activeTab === "tasks"     && <LeaguesTaskTool />}
    </div>
  );
}
