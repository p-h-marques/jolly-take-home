# Favorites — Action Plan

Action plan for [step 5 of the roadmap](05_roadmap.md).

- [x] Add `@react-native-async-storage/async-storage` dependency, per the [favorites persistence decision](04_tech_decisions.md): Done manually
- [x] `src/lib/favoritesStorage.ts`: thin AsyncStorage wrapper storing favorite show IDs as a single JSON-array key (`getFavoriteIds()` / `saveFavoriteIds(ids)`), same pure-module spirit as `stripHtml.ts` / `groupEpisodesBySeason.ts`: AI generated, plan [here](./plans/favorites-storage.md)
- [x] `useFavorites()` hook (`src/hooks/useFavorites.ts`): `useQuery` wrapping `favoritesStorage` (`queryKey: ["favorites"]`) plus a `toggleFavorite(id)` mutation that optimistically updates the query cache before persisting — keeps favorites state inside the TanStack Query cache already used everywhere else instead of adding a second state mechanism (Context/Zustand): AI generated, plan [here](./plans/favorites-storage.md)
- [x] `FavoriteButton` component (`src/components/FavoriteButton/index.tsx`): `Ionicons` heart/heart-outline `Pressable`, controlled via `isFavorite`/`onToggle` props — presentational, same pattern as `Badge`/`StatusBadge`, reusable in both the list row and the detail header: Done manually
- [x] Wire `FavoriteButton` into `ShowListItem`: heart at the top-right of the row, backed by `useFavorites`; since the whole row is currently wrapped in a `Link` (`ShowList`'s `ShowLink`), confirm the nested `Pressable` doesn't also trigger navigation — restructure the `Link` wrapping if it does: Done manually
- [x] Wire `FavoriteButton` into `ShowHeader`: heart near the title/status badge on the detail screen — closes the bullet deferred in [09_detail_view.md](09_detail_view.md): Done manually
- [x] `useFavoriteShows()` hook (`src/hooks/useFavoriteShows.ts`): given the IDs from `useFavorites`, fetch each show's full data with `useQueries` + `getShow` — no bulk-fetch-by-ids endpoint exists (per [02_tv_maze_api.md](02_tv_maze_api.md)), and reusing the `["show", id]` query key means a show already viewed on the detail screen loads from cache instead of refetching: AI generated, plan [here](./plans/favorite-shows-hook.md)
- [x] Favorites tab (`src/app/(tabs)/favorites.tsx`): replace `MOCK_FAVORITES` with `useFavorites` + `useFavoriteShows`, rendered through the existing `ShowList`/`ShowListItem` (no separate list UI): AI generated, plan [here](./plans/favorites-tab.md)
- [x] Empty state: no favorites yet (reuse `Empty`, custom copy — e.g. "No favorites yet"): AI generated, plan [here](./plans/favorites-tab.md)
- [x] Loading/error state for the favorite shows fetch (reuse `Loading`/`ErrorFeedback`): AI generated, plan [here](./plans/favorites-tab.md)
- [x] Favorites count: badge on the Favorites tab icon (`Tabs.Screen` `tabBarBadge`) and count next to the tab's header title (extend `ScreenTitle` or render inline beside it): AI generated, plan [here](./plans/favorites-count.md)
