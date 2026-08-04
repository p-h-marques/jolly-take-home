# JOLLY TV

Show Explorer — a small app for browsing TV shows using the free, public [TVMaze API](https://www.tvmaze.com/api) (no key, no auth). This is a take-home assignment; see [docs/01_objective.md](docs/01_objective.md) for the full brief.

## Running locally

Requirements: Node.js and either the [Expo Go](https://expo.dev/go) app on a physical device, an iOS Simulator, or an Android Emulator.

```bash
npm install
npm start
```

`npm start` opens Expo's dev tools — scan the QR code with Expo Go, or press `i` / `a` in the terminal to launch the iOS Simulator / Android Emulator. `npm run ios`, `npm run android`, and `npm run web` target a platform directly instead.

Other scripts:

- `npm test` (or `npm run test:watch`) — runs the unit tests (Jest, via `jest-expo`)
- `npm run lint` (or `lint:fix`) — Biome check/format

## Structure

- `bruno`: API docs with TV Maze API requests (list/search shows, list episodes) — importable into [Bruno](https://www.usebruno.com/)
- `docs`: documentation about the project
  - [01_objective.md](docs/01_objective.md) — assignment brief
  - [02_tv_maze_api.md](docs/02_tv_maze_api.md) — TVMaze API endpoints used, with example responses
  - `03_wireframes.png` — wireframes for the three screens (list, detail, favorites)
  - [04_tech_decisions.md](docs/04_tech_decisions.md) — technical decisions made before starting development
  - [05_roadmap.md](docs/05_roadmap.md) — high-level development roadmap, linking to a per-step action plan (`06_*.md`–`10_*.md`)
  - `plans`: implementation plans for AI-generated slices, referenced from the per-step action plans above

## Project structure

```txt
jolly-app
├── src
│   ├── app                             # Expo Router routes
│   │   ├── (tabs)
│   │   │   ├── index.tsx               # List — search & filter
│   │   │   └── favorites.tsx
│   │   └── shows
│   │       └── [id].tsx                # Detail (stacked, outside the tabs)
│   ├── api                             # HTTP client & TVMaze requests
│   │   ├── client.ts
│   │   ├── shows.ts
│   │   └── types.ts                    # Show, Episode, SearchResult...
│   ├── components                      # Generic reusable primitives (Button, Badge, Empty...)
│   ├── features                        # Complex, screen-level UI (e.g. ShowList)
│   ├── hooks                           # Data-fetching & screen-logic hooks (e.g. useShows)
│   ├── lib                             # Utility functions & config
│   └── styles
│       └── theme.ts                    # Centralized color definitions
```

Routes under `app` stay thin: they wire up data (via `hooks`) and delegate the actual screen UI to a component in `features`. Anything too complex or specific to a single screen to live in `components` (generic, reusable) belongs in `features` instead — e.g. `features/ShowList` holds the `FlatList`, its `renderItem`/`getItemLayout`, and related list-item components for the List screen, while `app/(tabs)/index.tsx` just calls `useShows()` and renders `<ShowList />`.

## Features

- **List view** — infinitely-scrolling list of shows (`GET /shows?page=`), showing name, image, and status. Handles loading, error, and empty states.
- **Search & filter** — search shows by name (`GET /search/shows?q=`) and filter by status (Running / Ended / To Be Determined).
- **Detail view** — show details plus its episodes (`GET /shows/:id/episodes`), grouped by season.
- **Favorites** — favorite/unfavorite shows; favorites persist across reloads (local storage), have their own view, and a visible count.

## API

All data comes from the public TVMaze API (`https://api.tvmaze.com`, no auth required), rate-limited to ~20 requests per 10 seconds per IP. See [docs/02_tv_maze_api.md](docs/02_tv_maze_api.md) for endpoint details and example responses, and the `bruno/` collection for ready-to-run requests.

## Key decisions & trade-offs

Full write-up in [docs/04_tech_decisions.md](docs/04_tech_decisions.md); the notable trade-offs:

- **Expo + Expo Router**, not bare React Native — file-based routing and first-party native modules (image, storage) cut setup time, at the cost of the extra flexibility bare RN gives for custom native code, which this app doesn't need.
- **TanStack Query for favorites too, no separate state layer** — favorites are just a list of show IDs persisted to AsyncStorage; wrapping that in a `useQuery` + optimistic mutation keeps it in the same cache as server data instead of adding Context/Zustand for one small slice of state.
- **No shared normalization layer for `/shows` vs `/search/shows`** — the two endpoints return different shapes, resolved inline via each hook's `select` option. A dedicated normalizer would be premature abstraction for two call sites.
- **Debounce only, no retry/throttle queue** — TVMaze allows ~20 req/10s; a 1s debounce on search keeps normal usage well under that.
- **Light theme, mobile only** — the provided wireframes only cover light/mobile, so building either dark mode or a web target would have been speculative scope.
- **Minimal, targeted test suite** — one test file for the status-filter combination logic (`src/features/StatusFilters/index.test.ts`) rather than broad coverage, to demonstrate testing know-how without over-investing in a take-home.

## What I'd do with more time

- Broader test coverage — hook-level tests and the loading/error/empty branches of each screen, beyond the one targeted unit test.
- Skeleton loading states instead of a centered spinner, for a less jarring first paint on the list/detail screens.
- A genre filter, since the show payload already carries `genres` and the status-filter UI would extend naturally.
- A dedicated offline state (e.g. via `NetInfo`) instead of folding "no connection" into the generic error screen.

## AI usage

Built with [Claude Code](https://claude.com/claude-code). The workflow: I wrote the objective/API/tech-decision/roadmap docs (`docs/01`–`05`) myself, then broke each roadmap step into a per-step action plan (`docs/06`–`10`) with a checklist of concrete items. Each checklist item is tagged either "Done manually" or "AI generated" (linking to an implementation plan under `docs/plans/`, written and reviewed before any code was generated) — so it's traceable per item which parts were hand-written versus AI-generated and reviewed. Roughly a third of the checklist items across all steps were done manually (initial scaffolding, UI wiring, component structure); the rest — mostly self-contained hooks, storage/query plumbing, and the unit test — were AI-generated from a reviewed plan.
