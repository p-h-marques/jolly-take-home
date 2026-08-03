# Search & Filter — Action Plan

Action plan for [step 3 of the roadmap](05_roadmap.md).

- [x] `useSearchShows` hook wrapping `searchShows` (`src/api/shows.ts`), keyed by query, with 1s debounce per [04_tech_decisions.md](04_tech_decisions.md): AI generated, plan [here](./plans/search-hook.md)
- [x] Normalize `/shows` and `/search/shows` response shapes into a single `Show[]`: already handled per-hook via `select` (`useShows`, `useSearchShows` in `src/hooks/`) — no separate normalization layer needed
- [x] `Badge` component: extract from the inline badge markup in `ShowListItem` (`src/components/ShowListItem/index.tsx`), reusable for both the list item status and the filter chips: Done manually
- [x] Search input UI on the List screen (`src/app/(tabs)/index.tsx`): text field, wired to the debounced hook: plan [here](./plans/search-integration.md)
- [x] Status filter UI: chips/segmented control for Running / Ended / To Be Determined, using `Badge`: Done manually
- [x] Combine search query + status filter client-side (filter the search/list results by `status` once results are in): Done manually
- [x] Switch `ShowList` between paginated `/shows` and flat `/search/shows` results depending on whether a query is active (no infinite scroll on search results): plan [here](./plans/search-integration.md)
- [x] Empty state: no results for the current search (status-filter combination deferred): plan [here](./plans/search-integration.md)
- [x] Loading state while a search request is in flight: plan [here](./plans/search-integration.md)
- [x] Error state: search request failure + retry: plan [here](./plans/search-integration.md)
