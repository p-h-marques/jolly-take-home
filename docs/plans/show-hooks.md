# Plan: `useShow` + `useShowEpisodes` hooks (Detail view, topic 4)

## Context

Next checklist items of [docs/09_detail_view.md](../09_detail_view.md) (roadmap step 4): the API functions `getShow` and `getShowEpisodes` already exist in [src/api/shows.ts](../../src/api/shows.ts), missing the TanStack Query hooks that `src/app/shows/[id].tsx` will consume to build the show header and the season-grouped episode list.

Two existing hooks define the pattern to follow:
- [src/hooks/useShows.ts](../../src/hooks/useShows.ts) — `useInfiniteQuery`, treats 404 as end-of-pagination.
- [src/hooks/useSearchShows.ts](../../src/hooks/useSearchShows.ts) — plain `useQuery` with a `select`.

Both use `queryFn: ({ signal }) => ...`, forwarding React Query's `AbortSignal` into the API function (already accepted as the last argument of `get<T>`, see [src/api/client.ts](../../src/api/client.ts)).

Per [04_tech_decisions.md](../04_tech_decisions.md), tests stay scoped to the status-filter logic — no unit test expected for these two hooks.

## Files to create/change

### 1. `src/hooks/useShow.ts` (new)

```ts
import { useQuery } from "@tanstack/react-query";
import { getShow } from "@/api/shows";

export function useShow(id: number | string) {
  return useQuery({
    queryKey: ["show", id],
    queryFn: ({ signal }) => getShow(id, signal),
  });
}
```

- No `select`: `getShow` already returns the `Show` shape the UI needs.
- No special 404 handling (unlike `useShows`) — here a 404 is a real error (show doesn't exist) and should propagate to the screen's `ErrorFeedback`, not be masked.
- No conditional `enabled`: `id` comes from `useLocalSearchParams<{ id: string }>()` on the `shows/[id]` route and is always present when the hook is called.

### 2. `src/hooks/useShowEpisodes.ts` (new)

```ts
import { useQuery } from "@tanstack/react-query";
import { getShowEpisodes } from "@/api/shows";

export function useShowEpisodes(id: number | string) {
  return useQuery({
    queryKey: ["show-episodes", id],
    queryFn: ({ signal }) => getShowEpisodes(id, undefined, signal),
  });
}
```

- `getShowEpisodes` accepts a second `opts?.specials` parameter — not exposed here, since nothing in the current roadmap item (grouping by `season`, airing order) calls for specials. Adding it now would be designing for a hypothetical requirement.
- Separate query key (`"show-episodes"`) from `useShow`'s (`"show"`) for independent caches — consistent with the doc item that treats episodes loading/error as independent from the header.

### 3. `docs/09_detail_view.md` (edit)

Check off the two relevant bullets, referencing this plan.

## Out of scope

This plan covers only the two hooks. Composing them in `src/app/shows/[id].tsx` (header, `SectionList` by season, loading/error states, summary HTML stripping, genre badges) is the next roadmap item and isn't part of this implementation.

## Conventions to follow

- Match [biome.json](../../biome.json): double quotes, semicolons, trailing commas, `organizeImports: "on"` — run `npm run lint:fix` after writing.
- `@/*` path alias for cross-file imports, not relative `../`.
- Near-zero comments; this slice doesn't need any (this plan doc carries the "why").

## Verification

1. `npx tsc --noEmit` — confirms both hooks type-check against `Show`/`Episode` from [src/api/types.ts](../../src/api/types.ts), and that `error` resolves to `ApiError | null` via the existing `Register` augmentation in [src/api/query-client.ts](../../src/api/query-client.ts).
2. `npm run lint` — Biome clean.
3. Temporary smoke test (same approach as prior hook plans): briefly call `useShow`/`useShowEpisodes` from `src/app/shows/[id].tsx` with a valid `id` (e.g. `1`), `console.log` the results, run `npm start`, confirm shapes match [docs/02_tv_maze_api.md](../02_tv_maze_api.md). Revert the temporary call afterward — real wiring of the screen is a separate, later topic.
4. Update `docs/09_detail_view.md` checklist as described above.
