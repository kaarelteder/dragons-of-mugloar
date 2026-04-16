# Dragons of Mugloar Frontend

Vite + Vue 3 + TypeScript frontend for the **Dragons of Mugloar** game.

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

## Build and Preview

```zsh
npm run build
npm run preview
```

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run preview` — preview the build
- `npm run type-check` — static type checking
- `npm run lint` — lint code
- `npm run format` — format code

## Testing

- `npm test` — runs unit and component tests using Vitest (located in `src/**/__tests__`)
- `npm run test:coverage` — runs the same tests with coverage reporting (output in `coverage/`)
- `npm run test:e2e` — runs end-to-end tests using Playwright (located in `tests/e2e/`)

## Environment Variables

Defined in `.env.example`:

- `VITE_API_BASE_URL` — API base URL (default: `https://dragonsofmugloar.com/api/v2`)

## Docker

Build and run with Docker:

```zsh
docker build -t dragons-of-mugloar-frontend .
docker run --rm -p 8080:80 dragons-of-mugloar-frontend
```

The app will be available at [http://localhost:8080](http://localhost:8080).

## Architecture

```
src/
├── main.ts                        # App entry point — mounts Vue app with Pinia and Router
├── App.vue                        # Root component — animated route transitions
├── router/
│   └── index.ts                   # Vue Router — route definitions and navigation guards
├── pages/
│   ├── HomePage.vue               # Start screen — begin a new game
│   ├── GamePage.vue               # Main game view — ads, shop, HUD
│   ├── HistoryPage.vue            # Past games list
│   └── NotFoundPage.vue           # 404 fallback
├── features/
│   ├── game/                      # Game lifecycle
│   │   ├── store/gameStore.ts     # Pinia store — active game state (id, lives, gold, score, turn)
│   │   ├── composables/useGame.ts # Start/reset game, navigate on game over
│   │   ├── api/gameApi.ts         # REST calls: startGame, solveAd
│   │   └── components/            # StartScreen, GameOverModal
│   ├── ads/                       # Quest board
│   │   ├── store/                 # advisorPreferencesStore — persisted playstyle preference
│   │   ├── composables/
│   │   │   ├── useAds.ts          # Fetch and refresh the ad board each turn
│   │   │   └── useAdAdvisor.ts    # Rank ads by weighted EV with playstyle + temporal decay
│   │   ├── utils/
│   │   │   ├── probability.ts     # Probability label → success rate + EV calculation
│   │   │   ├── risk.ts            # Risk tier classification (safe/medium/risky/dangerous)
│   │   │   └── decryption.ts      # Ad ID decoding — Base64 (encrypted=1), ROT13 (encrypted=2)
│   │   ├── api/adsApi.ts          # REST call: getMessages
│   │   └── components/            # AdBoard, AdCard, AdAdvisorPanel, ProbabilityBadge, UrgencyBar, EvDisplay, LegendModal
│   ├── shop/                      # In-game shop
│   │   ├── composables/useShop.ts # Fetch items and handle purchases
│   │   ├── api/shopApi.ts         # REST calls: fetchShop, buyItem
│   │   └── components/            # ShopPanel, ShopItemCard
│   ├── hud/                       # Heads-up display
│   │   ├── composables/useHud.ts  # Derives display values from gameStore
│   │   └── components/            # PlayerHud, LivesDisplay, GoldDisplay, ScoreDisplay, TurnCounter
│   └── history/                   # Game history
│       ├── store/historyStore.ts  # Pinia store (persisted) — past game records, high score
│       ├── composables/useHistory.ts
│       └── components/            # HistoryList, HistoryCard
└── shared/
    ├── api/
    │   ├── client.ts              # Axios instance with base URL and error interceptor
    │   └── errorHandling.ts       # Typed API error helpers
    ├── components/                # Button, Card, Badge, Modal, Spinner, Tooltip, Header,
    │                              #   GameEventBanner, GameExpiredState, ErrorBoundary
    ├── composables/
    │   └── useAsync.ts            # Generic loading/error wrapper for async operations
    ├── constants/animation.ts     # Shared animation timing constants
    └── types/index.ts             # Zod schemas and TypeScript types for all API shapes
```

### Key Components

**`gameStore`** (`features/game/store/gameStore.ts`)  
Central Pinia store for the active game session. Holds `gameId`, `lives`, `gold`, `score`, `highScore`, `turn`, and `isActive`. Exposes `startGame`, `applyResult`, `applyBuy`, and `reset` mutators. Drives the `requireActiveGame` navigation guard — the `/game` route redirects home if no active session exists.

**`useAdAdvisor`** (`features/ads/composables/useAdAdvisor.ts`)  
Ranks the ad board by weighted expected value:

```
weightedEV = applyPlaystyleWeight(ev × temporalDecay, probabilityRate, reward, playstyle)
```

Temporal decay penalises ads expiring in fewer than 5 turns (range 0.8 – 1.0). Playstyle (`safe` / `balanced` / `aggressive`) shifts the weighting between probability and reward. Produces a `AdvisorRecommendation` per ad with a `riskTier`, `riskReason`, `confidenceScore`, and human-readable `explanation`.

**`risk.ts`** (`features/ads/utils/risk.ts`)  
Classifies each ad into a risk tier based on failure chance and remaining lives:

| Tier        | Condition                                         |
| ----------- | ------------------------------------------------- |
| `safe`      | failure chance < 15 %                             |
| `medium`    | failure chance 15 – 49 %                          |
| `risky`     | failure chance ≥ 50 % **or** expires in ≤ 2 turns |
| `dangerous` | failure chance ≥ 70 %, or ≥ 50 % with ≤ 2 lives   |

**`decryption.ts`** (`features/ads/utils/decryption.ts`)  
Decodes encrypted ad IDs before submission: Base64 when `encrypted === 1`, ROT13 when `encrypted === 2`.

**`historyStore`** (`features/history/store/historyStore.ts`)  
Persisted Pinia store (via `pinia-plugin-persistedstate`) that records completed game snapshots. Exposes `sortedRecords` (newest first) and a `highScore` computed across all sessions.

**`useAsync`** (`shared/composables/useAsync.ts`)  
Lightweight generic composable that wraps any async call with reactive `loading` and `error` state, used throughout features to handle API calls uniformly.
