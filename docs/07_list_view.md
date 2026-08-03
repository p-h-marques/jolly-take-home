# List View — Action Plan

Action plan for [step 2 of the roadmap](05_roadmap.md).

- [x] `ScreenTitle` component: Done manually
- [x] Add `useInfiniteQuery` hook wrapping `getShows` (`src/api/shows.ts`), keyed by page, `getNextPageParam` incrementing the page number: AI generated, plan [here](./plans/shows-hook.md)
- [x] Wire `(tabs)/index.tsx` to the hook, replacing `MOCK_SHOWS`; trigger `fetchNextPage` via `FlatList`'s `onEndReached`: Done manually
- [x] Build `ShowListItem` component: image (with placeholder for `image: null`), name, status badge: Helped by AI
- [x] Pagination loading state: footer spinner while `isFetchingNextPage`: Done manually
- [x] Initial loading state: full-screen spinner/skeleton while first page loads: Done manually
- [ ] Error state: message + retry action on initial fetch failure
- [ ] Empty state: fallback message if `/shows` ever returns an empty page (edge case, unlikely but required by the brief)
- [ ] End-of-list handling: stop requesting once TVMaze returns an empty/short page (no `next` cursor in the API, so this is inferred from page size)
- [x] Fix `VirtualizedList` "slow to update" warning on large pages (~250 items/page): memoize `ShowListItem`, stabilize `renderItem`, add `getItemLayout`, tune FlatList windowing props: AI generated, plan [here](./plans/list-performance.md)
- [x] Reset scroll position when re-tapping the active tab (`useScrollToTop` on both `FlatList`s): AI generated, plan [here](./plans/scroll-to-top.md)
