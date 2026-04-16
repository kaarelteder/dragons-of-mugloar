# Dragons of Mugloar Bot

TypeScript bot for the **Dragons of Mugloar** game API, with strategy modules, scoring, and test coverage.

## Requirements

- Node.js `>=20`
- npm
- Docker (optional, for container run)

## Quick Start

```zsh
npm ci
cp .env.example .env
npm run dev
```

## Build and Run

```zsh
npm run build
npm start
```

## Scripts

- `npm run dev` — run directly from TypeScript sources
- `npm run build` — compile `src` to `dist`
- `npm start` — run compiled app from `dist/index.js`
- `npm run typecheck` — static type checking
- `npm test` — run test suite once
- `npm run test:coverage` — run tests with coverage report
- `npm run lint` / `npm run lint:fix` — lint code
- `npm run format` — format TypeScript files

## Environment Variables

Defined in `.env.example`:

- `BASE_URL` — API base URL (default: `https://dragonsofmugloar.com/api/v2`)
- `LOG_LEVEL` — logger level (for example `info`, `debug`, `error`)

## Docker

Build and run with Docker:

```zsh
docker build -t dragons-of-mugloar-bot .
docker run --rm --env-file .env dragons-of-mugloar-bot
```

## Architecture

```
src/
├── index.ts              # Entry point — loads env, runs GameLoop, exits with result code
├── types.ts              # Shared Zod schemas and TypeScript types
├── logger.ts             # Winston logger (level controlled via LOG_LEVEL)
├── api/
│   └── client.ts         # ApiClient — typed HTTP wrapper around the Mugloar REST API
├── game/
│   └── loop.ts           # GameLoop — main game orchestration loop
└── strategy/
    ├── scorer.ts          # TaskScorer — picks the best ad to solve each turn
    ├── outcomeTracker.ts  # OutcomeTracker — tracks per-probability win rates (Bayesian)
    └── shopStrategy.ts    # ShopStrategy — decides when and what to buy
```

### Key Components

**`GameLoop`** (`game/loop.ts`)  
Drives the game from start to finish. Each turn it fetches available ads, asks `TaskScorer` for the best candidate, solves it, and optionally triggers shopping. It retries on transient failures, recovers from 404 game-not-found errors, and exits cleanly when the target score (1 000) is reached or lives run out.

**`ApiClient`** (`api/client.ts`)  
Thin axios wrapper around the Dragons of Mugloar REST API. Validates all responses with Zod schemas and throws typed errors on failure. Endpoints covered: `startGame`, `getMessages`, `solveAd`, `getShopItems`, `buyItem`.

**`TaskScorer`** (`strategy/scorer.ts`)  
Scores each available ad using the formula:

```
score = (p × reward − (1 − p) × lifeValue) × urgencyMultiplier
```

where `p` is the empirical success rate from `OutcomeTracker`, `lifeValue` scales up sharply as lives decrease (50 → 100 → 300), and `urgencyMultiplier` boosts ads that expire soon. Ad IDs are decoded from Base64 (encrypted=1) or ROT13 (encrypted=2) before submission.

**`OutcomeTracker`** (`strategy/outcomeTracker.ts`)  
Maintains per-probability-label win/loss records and returns a Bayesian-smoothed success rate that blends observed outcomes with a calibrated prior:

```
rate = (successes + weight × prior) / (attempts + weight)
```

**`ShopStrategy`** (`strategy/shopStrategy.ts`)  
Buys items from the shop when lives are critically low (≤ 2) or periodically when gold is sufficient (≥ 50, every 5 turns). Life-restoring items (matched by keyword in name/id) are prioritised over stat items.
