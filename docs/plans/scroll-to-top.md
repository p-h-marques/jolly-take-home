# Plan: Reset scroll position when re-tapping the active tab (List view)

## Context

In the "List" and "Favorites" tabs (`src/app/(tabs)/`), re-tapping a tab that is already active left the `FlatList` at its current scroll position instead of returning to the top — the standard expected behavior for tabbed apps (iOS/Android). Neither list held a `ref`, and no navigation listener was wired up.

`@react-navigation/native` (already a transitive dependency via `expo-router`) exposes the official `useScrollToTop(ref)` hook for exactly this case: it walks up to the parent tab navigator(s), listens for the `tabPress` event, confirms the screen was already focused (`navigation.isFocused()`) and is the first screen in that tab's stack, then calls `scrollToOffset`/`scrollTo` on the given ref. Since `FlatList` exposes `getScrollResponder()`, the hook works on it out of the box — no manual `tabPress` listener needed.

## Files changed

### 1. `src/app/(tabs)/index.tsx`

Added a `listRef` (`useRef<FlatList>(null)`), wired it to the `FlatList`'s `ref` prop, and called `useScrollToTop(listRef)`.

### 2. `src/app/(tabs)/favorites.tsx`

Same pattern: `listRef`, `ref={listRef}` on the `FlatList`, `useScrollToTop(listRef)`.

No changes were needed in `_layout.tsx` — the hook discovers the parent tab navigator through the existing `expo-router`/React Navigation context.

## Conventions followed

- Matches `biome.json`: double quotes, semicolons, trailing commas, `organizeImports: "on"`.
- No custom wrapper hook: `useScrollToTop` is already the reusable piece (ships from React Navigation itself), so repeating the three lines in both screens is simpler than abstracting it.
- Near-zero comments; this slice didn't need any.

## Verification

1. `npx tsc --noEmit` — confirms `useRef<FlatList>` and `useScrollToTop` type-check.
2. `npm run lint` — Biome clean.
3. Manual: run the app, open "List", scroll down, switch to "Favorites" and back to "List" via the tab icon — the list stays at its scrolled position (switching tabs must not reset scroll).
4. Manual: with "List" already active, scroll down and tap the "List" tab icon again — the list animates back to the top. Repeat for "Favorites".
