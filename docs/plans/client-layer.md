# Plan: `src/api/` client layer (types.ts, client.ts, shows.ts)

## Context

The project ([Jolly TV / Show Explorer](README.md)) is an Expo/React Native take-home app that browses TV shows via the public TVMaze API. Per [docs/05_roadmap.md](docs/05_roadmap.md) step 1 ("Project setup") and its action-item checklist in [docs/06_project_setup.md](docs/06_project_setup.md), the base API client is the next unchecked item — routing (Expo Router tabs + detail stack) is already scaffolded in `src/app/`, but `src/api/` doesn't exist yet. This plan implements exactly that slice: a thin, typed HTTP client for the three TVMaze endpoints the assignment requires (`GET /shows?page=`, `GET /search/shows?q=`, `GET /shows/:id/episodes`), matching the shapes documented in [docs/02_tv_maze_api.md](docs/02_tv_maze_api.md) and mirrored in the `bruno/` collection.

Scope is deliberately narrow: this is only the `src/api/` layer (raw fetch + types), not TanStack Query hooks, not favorites/AsyncStorage, not UI, not tests — those are separate, later roadmap items and should not be pulled in here (avoids premature abstraction / scope creep in one PR).

## Files to create

### 1. `src/api/types.ts` — pure types, no runtime code

**Fields are limited to what the wireframes (`docs/03_wireframes.png`) actually render** — not the full TVMaze payload from `docs/02_tv_maze_api.md`. Walking the 3 screens:
- **List / Favorites** (screens 1 & 3): thumbnail image, name, status badge. (The heart/favorite state is local app state, not an API field.)
- **Detail** (screen 2): large image, name, status + genres (shown together as tags), summary text, and an episode list grouped by season (season, episode number, episode name, airdate).

Nothing in any screen uses `rating`, `network`/`webChannel`, `schedule`, `runtime`/`averageRuntime`, `premiered`/`ended`, `externals`, `url`, `weight`, `dvdCountry`, `type`, `language`, `updated`, `_links`, episode `airtime`/`airstamp`/`runtime`/`image`/`summary`, or the search endpoint's `score`. All of those — and their now-unneeded sub-shapes (`Rating`, `Network`, `Country`, `Schedule`, `ExternalIds`, `Link`, `ShowLinks`, `EpisodeLinks`) — are dropped.

```ts
export type ShowStatus = "Running" | "Ended" | "To Be Determined";

export interface ImageSet {
  medium: string;
  original: string;
}

export interface Show {
  id: number;
  name: string;
  status: ShowStatus;
  genres: string[];
  image: ImageSet | null;
  summary: string | null;
}

// /search/shows wraps each match as { score, show }; score isn't
// rendered anywhere in the UI (results already arrive relevancy-sorted),
// so only `show` is kept here.
export interface SearchResult {
  show: Show;
}

export interface Episode {
  id: number;
  season: number;
  number: number;
  name: string;
  airdate: string;
}
```

- `ImageSet` named to avoid colliding with RN's `Image` type. Both `medium` (list/favorites thumbnail) and `original` (detail hero image) are kept since both sizes are actually used.
- `image` and `summary` stay nullable (`| null`) — real TVMaze data can have either null (unaired/new shows), and the UI needs to handle that regardless of which fields are kept.
- This is a deliberate minimal-fields cut, not an oversight — worth a one-line comment in the file itself (e.g. above `Show`) saying fields are scoped to what `docs/03_wireframes.png` renders, so a future reader doesn't "fix" it by adding back the full TVMaze shape. If a later screen needs more (e.g. a rating badge), extend the interface then — no need to pre-add unused fields now.
- The actual TVMaze JSON response will still contain all the extra fields at runtime; TypeScript simply won't expose them through these interfaces, which is harmless since nothing reads them.

### 2. `src/api/client.ts` — thin fetch wrapper, no dependency on `types.ts`

- `const BASE_URL = "https://api.tvmaze.com"` — hardcoded constant. **No env/config plumbing** (`docs/06`'s "Set up env/config variables, if needed" item is N/A: TVMaze needs no key/auth and there's no per-environment URL variation for this take-home).
- `export class ApiError extends Error { readonly status: number; ... }` — lives here (transport concern), not in `types.ts` (domain shapes). Enables `instanceof ApiError` narrowing, keeps a real stack trace. Message built from `response.status`/`statusText` — TVMaze has no documented structured error body, so no JSON parsing on the error path.
- Internal (non-exported) `buildQueryString(params?: Record<string, string|number|boolean|undefined>)` using `URLSearchParams`; skips `undefined` values so optional params (e.g. `specials`) pass through cleanly.
- `export async function get<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T>` — builds the URL, calls `fetch`, throws `ApiError` on non-`ok`, otherwise returns `response.json()`.
- `signal?: AbortSignal` is included now even though nothing calls it yet: RN/Expo's native `fetch` already supports it, and the next roadmap step (TanStack Query) passes a `signal` into `queryFn` for cancellation — wiring the passthrough now avoids touching `client.ts` and every `shows.ts` call site again later.
- **No retry/backoff/throttle logic** — per [docs/04_tech_decisions.md](docs/04_tech_decisions.md), TVMaze rate-limit mitigation is a 1s debounce on the search *input* (a later UI-layer concern), not something the client itself should implement.
- No new dependencies: RN 0.81 / Expo SDK 54 ship native `fetch`, `AbortController`, and `URLSearchParams` — nothing to add to `package.json` for this slice.

### 3. `src/api/shows.ts` — one function per endpoint, thin 1:1 mapping

```ts
import { get } from "@/api/client";
import type { Episode, SearchResult, Show } from "@/api/types";

export function getShows(page: number, signal?: AbortSignal): Promise<Show[]>

export function searchShows(query: string, signal?: AbortSignal): Promise<SearchResult[]>

export function getShowEpisodes(
  showId: number | string,
  opts?: { specials?: boolean },
  signal?: AbortSignal,
): Promise<Episode[]>
```

- `getShows` → `GET /shows?page=N`, returns bare `Show[]`.
- `searchShows` → `GET /search/shows?q=STRING`, returns the **raw wrapped** `SearchResult[]` — deliberately *not* flattened to `Show[]`. Per [docs/05_roadmap.md](docs/05_roadmap.md) step 3, normalizing the `/shows` vs `/search/shows` shape mismatch into one list-item shape is explicitly a *Search & filter* concern (lives in `src/features/`), not this layer's job. Keeping `shows.ts` raw/honest also keeps it trivially simple — the normalization logic is what [docs/04_tech_decisions.md](docs/04_tech_decisions.md) names as the actual unit-test target later.
- `getShowEpisodes` → `GET /shows/:id/episodes[?specials=1]`. `showId: number | string` (Expo Router's `useLocalSearchParams` yields strings; avoids a forced cast at call sites). `opts.specials` maps to `specials=1` only when `true` (omitted otherwise — matches TVMaze's default-excluded behavior).
- No try/catch here — `ApiError` propagates untouched; handling it is a feature/UI-layer concern (loading/error states in the List/Detail screens, roadmap steps 2 & 4).

No `src/api/index.ts` barrel — only 3 files, each imported directly (`@/api/shows`, `@/api/types`); a barrel adds indirection with no benefit at this size.

## Conventions to follow

- Match [biome.json](biome.json): double quotes, semicolons always, trailing commas `"all"`, `organizeImports: "on"` (run `biome check --write` after scaffolding rather than hand-ordering imports).
- Use the `@/*` path alias ([tsconfig.json](tsconfig.json)) for cross-file imports between these files, not relative `../`.
- `import type { ... }` for type-only imports.
- Per [AGENTS.md](AGENTS.md): all comments in English, and — since Expo "has changed" — double-check the fetch/AbortController assumption against https://docs.expo.dev/versions/v54.0.0/ if anything looks off during implementation (expected to be a non-issue; these are standard JS runtime APIs, not Expo-versioned ones).
- Near-zero comments overall; the spots that justify one line each: (1) above `Show` in `types.ts`, noting fields are scoped to what the wireframes render, not the full TVMaze shape; (2) above `SearchResult`, noting `score` is dropped and `show` intentionally isn't flattened into `Show[]`; (3) near `get` in `client.ts`, noting there's no retry logic by design (see tech decisions).

## Implementation order

1. `types.ts` (no dependencies)
2. `client.ts` (no dependency on `types.ts` — stays domain-agnostic)
3. `shows.ts` (depends on both)

## Verification

1. `npx tsc --noEmit` — confirm the new files type-check cleanly against `tsconfig.json` (strict mode).
2. `npm run lint` (Biome) — confirm formatting/import-order rules pass.
3. Manual smoke test: temporarily call `getShows(0)`, `searchShows("girls")`, and `getShowEpisodes(1)` from a route file (e.g. a `useEffect` + `console.log` in `src/app/(tabs)/index.tsx`), run `npm start`, and confirm the logged shapes match the examples in `docs/02_tv_maze_api.md` / the `bruno/` collection responses. Remove the temporary call afterward — this is a throwaway check, not a permanent test (unit tests are roadmap step 6, targeting the search/filter normalization logic once it exists in `src/features/`).
4. Update the `docs/06_project_setup.md` checklist: check off "Create base API client pointing to TVMaze" once done.
