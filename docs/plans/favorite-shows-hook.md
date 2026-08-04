# Plan: `useFavoriteShows` hook (Favorites, roadmap step 5)

## Context

Next unchecked item in [10_favorites.md](../10_favorites.md) (bullet 11, roadmap step 5): given the favorite show IDs, fetch each show's full data via `useQueries` + `getShow` — there's no bulk-fetch-by-ids endpoint on the TVMaze API ([02_tv_maze_api.md](../02_tv_maze_api.md)), and the whole point of reusing the `["show", id]` query key is that a show already viewed on the detail screen (`src/app/shows/[id].tsx`) loads instantly from cache instead of refetching.

This is the first use of `useQueries` in the codebase. Three existing hooks define adjacent patterns:
- [src/hooks/useShow.ts](../../src/hooks/useShow.ts) — plain `useQuery`, the one whose cache this hook must share.
- [src/hooks/useFavorites.ts](../../src/hooks/useFavorites.ts) — the source of favorite IDs.
- [src/features/ShowList/index.tsx](../../src/features/ShowList/index.tsx) — precedent for hoisting a function to module scope purely for referential stability (`renderShow`), which is the same justification used below for `combine`.

**Bug caught during design (verified against `node_modules/@tanstack/query-core`, not just theorized):** `useShow(id)` is called from `src/app/shows/[id].tsx` with `id` coming from `useLocalSearchParams<{ id: string }>()` — always a **string**. So the detail screen's cache entries are keyed `["show", "180"]`. `Show.id` (from `src/api/types.ts`) is a **number**. TanStack Query hashes cache keys via `JSON.stringify` (confirmed at `node_modules/@tanstack/query-core/build/modern/utils.js:85`), and `JSON.stringify(["show", 180])` ≠ `JSON.stringify(["show", "180"])` — these are different cache entries. Building the query key with the raw numeric id here would silently defeat the entire cache-sharing goal (data would still load fine, it would just always refetch instead of hitting cache — the kind of thing that passes `tsc`/lint/a casual smoke test and only shows up on network inspection).

**Fix:** extract a shared `showQueryKey(id)` helper in `useShow.ts` that normalizes to `["show", String(id)]`, used by both `useShow` and `useFavoriteShows`, so the key shape can't drift between the two call sites.

**Hook signature:** `useFavoriteShows()` takes no arguments — it calls `useFavorites()` internally to get `favoriteIds`, rather than requiring the caller to pass them in. Because of this, the hook's own `isPending`/`isError` must also account for the `["favorites"]` AsyncStorage read still being in flight (`useFavorites()`'s `status`) — otherwise a cold app start would report `{ shows: [], isPending: false }` while favorite IDs are still loading from storage, which would misrender as "no favorites" instead of "loading."

## Files created/changed

### 1. `src/hooks/useShow.ts` (edit — small, additive)

```ts
import { useQuery } from "@tanstack/react-query";
import { getShow } from "@/api/shows";

export function showQueryKey(id: number | string) {
  return ["show", String(id)] as const;
}

export function useShow(id: number | string) {
  return useQuery({
    queryKey: showQueryKey(id),
    queryFn: ({ signal }) => getShow(id, signal),
  });
}
```

No behavior change for existing callers: `useShow` is always called with a string id already, and `String("180") === "180"`, so existing cache entries are unaffected.

### 2. `src/hooks/useFavoriteShows.ts` (new)

```ts
import { useQueries } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { getShow } from "@/api/shows";
import type { Show } from "@/api/types";
import { useFavorites } from "@/hooks/useFavorites";
import { showQueryKey } from "@/hooks/useShow";

function toShowQuery(id: number): UseQueryOptions<Show> {
  return {
    queryKey: showQueryKey(id),
    queryFn: ({ signal }) => getShow(id, signal),
  };
}

// Stable reference: an inline combine would be a new function every render,
// forcing useQueries to recompute unnecessarily (it compares combine by
// reference to decide whether to re-run it).
function combineFavoriteShows(results: UseQueryResult<Show>[]) {
  return {
    shows: results
      .map((result) => result.data)
      .filter((show): show is Show => show !== undefined),
    isPending: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
  };
}

export function useFavoriteShows() {
  const { favoriteIds, status: favoritesStatus } = useFavorites();

  const { shows, isPending, isError } = useQueries({
    queries: favoriteIds.map(toShowQuery),
    combine: combineFavoriteShows,
  });

  return {
    shows,
    isPending: favoritesStatus === "pending" || isPending,
    isError: favoritesStatus === "error" || isError,
  };
}
```

- `toShowQuery` is a named module-level function (not inlined in `.map()`) so `queryFn`'s `{ signal }` param types correctly — contextual typing from `useQueries` doesn't flow through an inline `.map()` callback, but it does through a function with an explicit `UseQueryOptions<Show>` return annotation.
- `combine`'s `results` param types as `UseQueryResult<Show>[]` (TError defaults to the app-wide registered `ApiError` via the `Register.defaultError` augmentation in `src/api/query-client.ts`, same as every other hook).
- Empty favorites (`favoriteIds = []`) → `queries: []` → `combineFavoriteShows([])` → `{ shows: [], isPending: false, isError: false }`, safe.
- No `error`/per-item retry exposed — deliberately minimal; the two follow-up roadmap bullets (loading/error UI, the Favorites tab itself) aren't built yet and will make the real requirement concrete. `ErrorFeedback`'s `onRetry` prop is optional, so a future screen can render `<ErrorFeedback />` without retry wiring for now.

### 3. `docs/10_favorites.md` (edit)

Checked off bullet 11, referencing this plan.

## Out of scope

Favorites tab wiring (`src/app/(tabs)/favorites.tsx`, still on `MOCK_FAVORITES`), the empty/loading/error UI for the favorites list, and the favorites-count badge are separate, later bullets in `docs/10_favorites.md` (12–15) — not part of this change.

## Conventions followed

- Match [biome.json](../../biome.json): double quotes, semicolons, trailing commas, `organizeImports: "on"`.
- `@/*` path alias, not relative `../`.
- Function declarations, not arrow consts (matches `useShow`, `useFavorites`, `renderShow` in `ShowList`).
- Near-zero comments — the one comment above `combineFavoriteShows` documents a non-obvious WHY (reference-stability requirement for `useQueries`' `combine`), same style as `ShowList/index.tsx`'s comment above `renderShow`.
- No test file — per [04_tech_decisions.md](../04_tech_decisions.md), testing stays scoped to the status-filter logic; consistent with `useShow`/`useShowEpisodes`/`useShows` also having no test file.

## Verification

1. `npx tsc --noEmit` — confirms both files type-check, including `UseQueryResult<Show>[]` resolving `TError` to `ApiError` via the `Register` augmentation.
2. `npm run lint` — Biome clean.
3. Temporary smoke test: toggle a favorite via the already-working `FavoriteButton`, then briefly call `useFavoriteShows()` from a `useEffect` in `(tabs)/favorites.tsx`, `console.log` the result, run `npm start`, confirm `shows` populates with that show's full data.
4. **Cache-sharing check specifically** (the one behavior easy to get silently wrong): open a show's detail screen first (populating `["show", "<id>"]`), favorite it, then confirm `useFavoriteShows()`'s fetch for that same id resolves immediately from cache rather than firing a new network request (check via React Query Devtools or the network tab) — this is the actual bug this plan's `showQueryKey` fix prevents.
5. Revert the temporary smoke-test call in `favorites.tsx` afterward — real screen wiring is bullet 12, a separate task.
6. Update `docs/10_favorites.md` checklist as described above.
