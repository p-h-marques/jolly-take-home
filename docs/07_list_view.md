# List View — Action Plan

Action plan for [step 2 of the roadmap](05_roadmap.md).

- [x] `ScreenTitle` component: Done manually
- [x] Add `useInfiniteQuery` hook wrapping `getShows` (`src/api/shows.ts`), keyed by page, `getNextPageParam` incrementing the page number: AI generated, plan [here](./plans/shows-hook.md)
- [x] Wire `(tabs)/index.tsx` to the hook, replacing `MOCK_SHOWS`; trigger `fetchNextPage` via `FlatList`'s `onEndReached`: Done manually
- [ ] Build `ShowListItem` component: image (with placeholder for `image: null`), name, status badge
- [ ] Pagination loading state: footer spinner while `isFetchingNextPage`
- [ ] Initial loading state: full-screen spinner/skeleton while first page loads
- [ ] Error state: message + retry action on initial fetch failure
- [ ] Empty state: fallback message if `/shows` ever returns an empty page (edge case, unlikely but required by the brief)
- [ ] End-of-list handling: stop requesting once TVMaze returns an empty/short page (no `next` cursor in the API, so this is inferred from page size)
