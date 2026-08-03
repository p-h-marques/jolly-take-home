# Plan: `useSearchShows` hook

## Context

First item of [08_search_filter_shows.md](../../projects/pessoal/jolly-take-home/docs/08_search_filter_shows.md) (step 3 of the roadmap). We need a hook that wraps `searchShows` (`src/api/shows.ts`) with a 1s debounce on the query, per the rate-limiting decision in [04_tech_decisions.md](../../projects/pessoal/jolly-take-home/docs/04_tech_decisions.md). This hook will later feed the search input on the List screen and be combined with the status filter (separate, later todo item).

The existing `useShows` hook (`src/hooks/useShows.ts`) is the direct precedent to follow: same folder, same `useX` naming, same `select` pattern to reshape the raw API response into what the UI consumes, same reliance on `ApiError`/TanStack Query defaults already configured in `src/api/query-client.ts` (global `retry: false`).

## Approach

Single new file: `src/hooks/useSearchShows.ts`, using `useQuery` (not `useInfiniteQuery` — search results aren't paginated).

- Debounce is implemented inline with `useState` + `useEffect`/`setTimeout` inside the hook itself — no new dependency (no lodash/debounce in `package.json`), and no separate `useDebouncedValue` hook since there's currently only this one consumer (avoids a premature abstraction).
- The hook takes the *raw* (immediately-typed) query string as its argument. The caller (List screen) keeps the raw text in local state for instant input feedback; the hook internally debounces before firing the request. This matches how the todo item is worded ("keyed by query, with 1s debounce").
- Query is trimmed before debouncing/comparison, so whitespace-only input doesn't trigger a request.
- `enabled: debouncedQuery.length > 0` — no request fires for an empty query. This leaves room for the List screen to fall back to the plain `/shows` list when there's no active search (a later todo item), without this hook needing to know about that.
- `select` maps `SearchResult[]` (`{ score, show }`) to `Show[]`, mirroring how `useShows` already reshapes its raw response — keeps the UI-facing return type identical between the two hooks (both `Show[]`), which will matter when `ShowList` needs to switch between them.
- `queryFn` receives `signal` from TanStack Query and forwards it to `searchShows(query, signal)`, same as `getShows` does in `useShows`.
- No manual `ApiError` handling needed (unlike `useShows`'s 404-on-empty-page case) — an empty match set from `/search/shows` is a normal `200 []`, not a 404.

```ts
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchShows } from "@/api/shows";

const SEARCH_DEBOUNCE_MS = 1000;

export function useSearchShows(query: string) {
  const trimmed = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(trimmed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [trimmed]);

  return useQuery({
    queryKey: ["search-shows", debouncedQuery],
    queryFn: ({ signal }) => searchShows(debouncedQuery, signal),
    enabled: debouncedQuery.length > 0,
    select: (data) => data.map((result) => result.show),
  });
}
```

## Verification

- `npx tsc --noEmit` (or the project's existing type-check path) to confirm types line up with `Show`/`SearchResult` from `src/api/types.ts`.
- `npm run lint` (Biome) to match repo formatting conventions.
- Manual sanity check isn't wired to any screen yet (that's the next todo item), so no UI verification at this stage — this task is scoped to the hook file only.

## Out of scope (future todo items in 08_search_filter_shows.md)

- Wiring this hook into the List screen's search input.
- Combining with the status filter.
- Switching `ShowList` between `/shows` pagination and flat search results.
- Loading/empty/error UI states for search.
