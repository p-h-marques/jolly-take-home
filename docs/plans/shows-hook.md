# Plan: `useShows` infinite-query hook (List view, topic 1)

## Context

This is the first checklist item of [docs/07_list_view.md](docs/07_list_view.md) (roadmap step 2): a `useInfiniteQuery` hook wrapping `getShows`, to replace `MOCK_SHOWS` in `(tabs)/index.tsx` later (that wiring is a separate, later topic — out of scope here).

All the decisions below were already made collaboratively in conversation before this plan:

- Hook lives in a new `src/hooks/` folder (not `src/features/`, which was only ever an aspirational README structure that never existed in code) — `src/hooks/useShows.ts`, exporting `useShows()`, no arguments for now (status/search filtering is roadmap step 3).
- `queryKey: ["shows"]` — no params yet, so no need for a richer key.
- `initialPageParam: 0` — confirmed against the real TVMaze API (0-indexed), not assumed.
- `getNextPageParam` stays **naive** (`lastPageParam + 1`, always) — the "stop at empty/short page" heuristic is explicitly deferred to a later, separate checklist item ("End-of-list handling") in `07_list_view.md`.
- `data` is flattened from `Show[][]` (TanStack's per-page `data.pages`) to a plain `Show[]` via the `select` option, since the only consumer (`FlatList`) wants one flat list and there's no foreseeable need for the per-page structure.
- Everything else from `useInfiniteQuery` (`isLoading`, `isFetchingNextPage`, `fetchNextPage`, `error`, etc.) is passed through raw — the hook doesn't reshape or rename the rest of the surface, so the screen (a later topic) picks whatever it needs.
- Error typing: register `ApiError` (from [src/api/client.ts](src/api/client.ts)) as the app-wide default error type via TanStack v5's `Register` interface (module augmentation), added to [src/api/query-client.ts](src/api/query-client.ts) — the one file that already configures TanStack for the whole app. Every current/future query hook then gets `error: ApiError | null` for free, since every API call goes through `get()`, which only ever throws `ApiError`.

This also follows the project's established pattern of a per-slice plan doc under `docs/plans/` (see `client-layer.md`, `tanstack-query-layer.md`), referenced from the roadmap checklist once done.

## Files to create/change

### 1. `src/hooks/useShows.ts` (new)

```ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getShows } from "@/api/shows";

export function useShows() {
  return useInfiniteQuery({
    queryKey: ["shows"],
    queryFn: ({ pageParam, signal }) => getShows(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
    select: (data) => data.pages.flatMap((page) => page),
  });
}
```

- Reuses `getShows` from [src/api/shows.ts](src/api/shows.ts) as-is — no changes needed there, it already accepts `(page, signal)`.
- No explicit generics needed; `TQueryFnData` infers from `getShows`'s `Promise<Show[]>` return type, and `TError` comes from the global `Register` augmentation (see below).

### 2. `src/api/query-client.ts` (edit)

Add a module augmentation registering `ApiError` as the default error type app-wide:

```ts
import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/api/client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}
```

### 3. `docs/plans/shows-hook.md` (new)

A plan doc matching the style/structure of `client-layer.md` and `tanstack-query-layer.md` (Context, Files to create/change, Conventions, Implementation order, Verification) — documents this exact plan for the repo's history, in English per [AGENTS.md](AGENTS.md).

### 4. `docs/07_list_view.md` (edit)

Check off the first bullet:
```md
- [x] Add `useInfiniteQuery` hook wrapping `getShows` (`src/api/shows.ts`), keyed by page, `getNextPageParam` incrementing the page number: AI generated, plan [here](./plans/shows-hook.md)
```

## Conventions to follow

- Match [biome.json](biome.json): double quotes, semicolons, trailing commas, `organizeImports: "on"` — run `npm run lint:fix` after writing.
- `@/*` path alias for cross-file imports, not relative `../`.
- `import type { ... }` for the `ApiError` type-only import.
- Near-zero comments; this slice doesn't need any (the plan doc carries the "why").

## Verification

1. `npx tsc --noEmit` — confirms `useShows.ts` type-checks, and specifically that `error` resolves to `ApiError | null` (not the default `Error | null`) thanks to the `Register` augmentation.
2. `npm run lint` — Biome clean.
3. Temporary smoke test (same approach as `client-layer.md`): briefly call `useShows()` from a `useEffect`/render in `src/app/(tabs)/index.tsx` and `console.log` the flattened `data`, run `npm start`, confirm shapes match `docs/02_tv_maze_api.md`. Revert the temporary call afterward — real wiring of `index.tsx` is a separate, later topic.
4. Update `docs/07_list_view.md` checklist as described above.
