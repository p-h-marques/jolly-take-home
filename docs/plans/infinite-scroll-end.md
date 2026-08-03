# Treat pagination 404 in `useShows` as end of list

## Context

The TVMaze API doesn't expose a total page count for `/shows` — it simply responds with `404` when the requested page is past the last existing one. Today, `get()` in [src/api/client.ts](src/api/client.ts) treats any non-2xx response (including this expected 404) as an `ApiError` and throws. That error bubbles up to the `queryFn` of the `useInfiniteQuery` in [src/hooks/useShows.ts](src/hooks/useShows.ts), flipping the whole query's `status` to `"error"` — which triggers `ErrorFeedback` on top of the already-loaded list (`src/app/(tabs)/index.tsx:28-30`), even with valid data on screen.

Goal: make the hook recognize this specific 404 as "no more pages" (natural end of pagination), without affecting the handling of real errors (network, 5xx, etc.), which should keep propagating normally. Scope agreed with the user: **only this fix** — no changes to the "load more" error UX for real failures, and no automated tests (there's no fetch-mocking infrastructure in the repo today; that would be out of scope for this take-home).

## Changes

### 1. `src/hooks/useShows.ts` — catch the 404 inside `queryFn`

Import `ApiError` from `@/api/client` and wrap the `getShows` call in a try/catch:

```ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { getShows } from "@/api/shows";

export function useShows() {
  return useInfiniteQuery({
    queryKey: ["shows"],
    queryFn: async ({ pageParam, signal }) => {
      try {
        return await getShows(pageParam, signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return [];
        }
        throw error;
      }
    },
    initialPageParam: 370,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + 1,
    select: (data) => data.pages.flat(),
  });
}
```

Key points:
- Only `status === 404` is intercepted and converted into an empty page (`[]`). Any other error (network, 5xx, etc.) is rethrown and still falls into the existing error flow (`status === "error"` → `ErrorFeedback` in `index.tsx`) — nothing changes for real errors.
- `getNextPageParam` now looks at the content of `lastPage`: if it came back empty (meaning the last attempt hit the 404), it returns `undefined`, which naturally flips `hasNextPage` to `false`. The `FlatList` in [src/features/ShowList/index.tsx:64-68](src/features/ShowList/index.tsx) already uses `shouldFetchNextPage` (`hasNextPage && !isFetching`) to decide whether to call `fetchNextPage` on `onEndReached` — so that component needs no changes at all, it will simply stop calling `fetchNextPage` once `hasNextPage` becomes `false`.
- This is specific to `/shows`'s pagination semantics; it doesn't affect `searchShows`/`getShowEpisodes`, where a 404 is a genuine error.

### 2. `src/api/shows.ts` — remove debug log

Remove the `console.log(\`page: ${page}\`);` line in `getShows` (line 5) — leftover debug output, unrelated to business logic.

## Affected files

- `src/hooks/useShows.ts` (main change)
- `src/api/shows.ts` (`console.log` cleanup)

No changes needed in `src/features/ShowList/index.tsx`, `src/app/(tabs)/index.tsx`, `src/api/client.ts`, or `src/components/Error/index.tsx` — all of them already consume `hasNextPage`/`status` in a way that's compatible with the fix.

## Verification

There's no fetch-mocking infrastructure in the repo (only a pure unit test for `buildQueryString` in `src/api/client.test.ts`), so verification here is manual, running the app:

1. `npm start` (or the configured dev command) and open the shows list screen.
2. Scroll to the end of the list repeatedly (or temporarily lower `initialPageParam` to a value close to the actual last page, currently ~369-370, to reach the end quickly) and confirm that:
   - The list quietly stops growing when it hits the 404 (no `ErrorFeedback` appearing, no infinite "Loading more..." spinner).
   - `hasNextPage` becomes `false` and `onEndReached` stops triggering `fetchNextPage` (confirmable via a temporary log or by the absence of new network calls in devtools/Metro logs).
3. Simulate a real error (e.g., turn off the network or force a 500 by temporarily changing the `BASE_URL`) during initial load and confirm that `ErrorFeedback` with "Try Again" still appears normally — making sure the 404 catch didn't silence other kinds of errors.
