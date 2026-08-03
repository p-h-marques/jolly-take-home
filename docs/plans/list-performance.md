# Plan: Fix `VirtualizedList` "slow to update" warning (List view)

## Context

While testing the list screen, the following RN warning showed up in the console:

> VirtualizedList: You have a large list that is slow to update - make sure your renderItem function renders components that follow React performance best practices like PureComponent, shouldComponentUpdate, etc.

Each `/shows` page returns ~240-260 items (TVMaze's fixed page size — not configurable via query param), so the list accumulates hundreds of rows within the first couple of `fetchNextPage()` calls.

Diagnosis, done by reading [`(tabs)/index.tsx`](../../src/app/(tabs)/index.tsx), [`ShowListItem`](../../src/components/ShowListItem/index.tsx) and [`useShows`](../../src/hooks/useShows.ts), found 4 concrete causes:

1. `ShowListItem` wasn't memoized, so every time the FlatList's `data` reference changed (e.g. a new page arriving), already-mounted rows re-rendered even though their own `show` prop hadn't changed.
2. `renderItem` was an inline arrow function recreated on every render of `List`, which defeats any memoization further down the tree.
3. No `getItemLayout` was provided, even though row height is fixed (56px thumbnail + 24px vertical padding + 1px bottom border = 81px) — FlatList was measuring every row dynamically instead of using a formula.
4. FlatList's default windowing (`windowSize={21}`, ~21 viewport-heights kept mounted) is far too generous for 81px rows: that's 200+ rows mounted at once, effectively keeping an entire page in memory/layout at all times. This was the most likely direct cause of the warning.

Explicitly out of scope: switching from `FlatList` to `@shopify/flash-list` — decided to stay dependency-free for this fix.

## Files changed

### 1. `src/components/ShowListItem/index.tsx`

- Wrapped the default export in `memo()`. Safe with the default shallow comparator (no custom `areEqual` needed): `IProps` has a single field (`show`), and `useShows`'s `select: (data) => data.pages.flat()` never clones the individual `Show` objects — `.flat()` only flattens the array-of-arrays structure — so each item's reference stays stable across re-selects unless its underlying data actually changed.
- Added and exported an `ITEM_HEIGHT = 81` constant next to `styles`, with a comment tying the number back to the specific style values it's derived from, so it doesn't silently drift if `ShowListItem`'s layout changes later.

### 2. `src/app/(tabs)/index.tsx`

- Added a module-level `ShowLink` component (own `IProps { show: Show }`) wrapping `Link` + `ShowListItem`, wrapped in `memo`. Needed because FlatList's `renderItem` hands us `{ item }`, but `Link`'s `href` needs `item.id` and `ShowListItem` wants a `show` prop — this bridges the two.
- Added a module-level `renderShow({ item })` function passed as `renderItem={renderShow}`, replacing the inline arrow. Module-level (not `useCallback`) because it doesn't need to close over anything from `List`, and matches this codebase's existing pattern of plain top-level function components.
- Added a module-level `getItemLayout` using `ITEM_HEIGHT` imported from `ShowListItem`: `{ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }`.
- Tuned FlatList's windowing props for ~250-item pages and 81px rows (~9-10 rows per screen):
  - `initialNumToRender={12}` / `maxToRenderPerBatch={12}` — roughly one screen plus buffer per render batch.
  - `windowSize={7}` — down from the default 21; keeps ~3 screens above/below mounted instead of ~21. The main lever for the warning.
  - `updateCellsBatchingPeriod={50}` — RN's own default, set explicitly to document intent.
  - `removeClippedSubviews` — enabled, to detach off-screen native views once several pages are loaded.

No changes to `src/hooks/useShows.ts` — its `select` already produces the referentially-stable `Show` objects that make the `ShowListItem` memoization effective.

## Conventions followed

- `IProps` interface convention (prefixed `I`, typed in the function signature, destructured in the body).
- `StyleSheet.create` kept separate from and below the component.
- Biome formatting/lint (`npm run lint:fix`), `@/*` path alias.
- Near-zero comments — the one exception is the `ITEM_HEIGHT` line, since the "why" (must stay in sync with `ShowListItem`'s own styles) isn't obvious from the number alone.

## Verification

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — Biome clean.
3. `npm start`, opened the list tab, scrolled through several `fetchNextPage()` triggers (~500-750 items): the `VirtualizedList` warning no longer appears, scrolling stays smooth, and tapping a row still navigates to `/shows/[id]` correctly.
