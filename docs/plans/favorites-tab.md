# Plan: Favorites tab + empty/loading/error states (Favorites, roadmap step 5)

## Context

Next checklist items of [docs/10_favorites.md](../10_favorites.md) (roadmap step 5), bullets 12–14: the Favorites tab still renders a hardcoded `MOCK_FAVORITES` array through its own `FlatList`, with no loading, error, or empty handling. `useFavorites`/`useFavoriteShows` (already built) and `ShowList`/`ShowListItem` (already built for the List tab) supply everything needed — this is wiring, not new data logic.

[src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx) (the List screen) already establishes the loading → error → empty → data branch order used across the app, backed by `Loading`, `ErrorFeedback` (`src/components/Error`), and `Empty`. Favorites reuses the same branch order, minus the search/pagination logic that doesn't apply to a favorites list.

## Files created/changed

### 1. `src/hooks/useFavoriteShows.ts` (edit — small, additive)

```ts
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { getShow } from "@/api/shows";
import type { Show } from "@/api/types";
import { useFavorites } from "@/hooks/useFavorites";
import { showQueryKey } from "@/hooks/useShow";

function toShowQuery(id: number): UseQueryOptions<Show> {
  return {
    queryKey: showQueryKey(id),
    queryFn: ({ signal }) => getShow(id, signal),
  };
}

function combineFavoriteShows(results: UseQueryResult<Show>[]) {
  return {
    shows: results
      .map((result) => result.data)
      .filter((show): show is Show => show !== undefined),
    isPending: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
  };
}

export function useFavoriteShows() {
  const { favoriteIds, status: favoritesStatus } = useFavorites();
  const queryClient = useQueryClient();

  const { shows, isPending, isError } = useQueries({
    queries: favoriteIds.map(toShowQuery),
    combine: combineFavoriteShows,
  });

  function refetch() {
    return Promise.all(
      favoriteIds.map((id) =>
        queryClient.refetchQueries({ queryKey: showQueryKey(id) }),
      ),
    );
  }

  return {
    shows,
    isPending: favoritesStatus === "pending" || isPending,
    isError: favoritesStatus === "error" || isError,
    refetch,
  };
}
```

- The original plan ([favorite-shows-hook.md](./favorite-shows-hook.md)) deliberately shipped without a retry path, deferring it until the tab itself made the requirement concrete. It's concrete now: [src/api/query-client.ts](../../src/api/query-client.ts) sets `retry: false` globally, so a network blip fails immediately with no automatic retry anywhere in the app — every other error screen (`index.tsx`) gives the user a manual `onRetry`, and Favorites having none would be the one inconsistent screen.
- `refetch` is computed as a plain field on the hook's return object, **not** added inside `combine`'s returned object. `combine`'s memoization (`replaceEqualDeep` in `@tanstack/query-core`) does `===` on each returned key; a closure created inside `combine` is a new reference every invocation, which would defeat the same "stable reference" discipline the file already documents for `combine` itself.

### 2. `src/components/Empty/index.tsx` (edit — small, additive)

```tsx
import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  title?: string;
  description?: string;
}

export default function Empty(props: IProps) {
  const {
    title = "No data found",
    description = "Try a different search or\nclear the status filter.",
  } = props;

  return (
    <View style={styles.container}>
      <Ionicons
        name="help-circle-outline"
        size={48}
        color={colors.placeholderBackground}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ /* unchanged */ });
```

- `title`/`description` are optional and default to the exact previous copy, so the List screen's existing bare `<Empty />` usage is unaffected.
- The old JSX used `{"\n"}` mid-text to force a line break; a plain `\n` embedded in a JS string interpolated via `{description}` renders identically — React's JSX-whitespace-collapsing rules only apply to literal text written directly in JSX source, not to string values passed through `{}`.

### 3. `src/app/(tabs)/favorites.tsx` (rewrite)

```tsx
import { StyleSheet, View } from "react-native";
import Empty from "@/components/Empty";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import ShowList from "@/features/ShowList";
import { useFavoriteShows } from "@/hooks/useFavoriteShows";

export default function Favorites() {
  const { shows, isPending, isError, refetch } = useFavoriteShows();
  const hasData = !!shows.length;

  return (
    <View style={styles.container}>
      {isPending && <Loading />}

      {isError && !isPending && !hasData && <ErrorFeedback onRetry={refetch} />}

      {!isPending && !isError && !hasData && (
        <Empty
          title="No favorites yet"
          description="Tap the heart on a show to add it here."
        />
      )}

      {!isPending && hasData && <ShowList shows={shows} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

- No `useScrollToTop`/`useRef` here — `ShowList` already owns its own `listRef` + `useScrollToTop` internally (same as `index.tsx`, which doesn't set it up either).
- No `Pressable`/`Keyboard.dismiss` wrapper — that's only in `index.tsx` because of its `TextInput`; Favorites has no text input.
- `ShowList`'s pagination props (`fetchNextPage`, `shouldFetchNextPage`, etc.) are all optional and default falsy, so `<ShowList shows={shows} />` alone is valid — no infinite scroll needed for a favorites list.
- Un-favoriting a show from within this tab needs no extra wiring: each `ShowListItem` already calls `useFavorites()` internally for its `FavoriteButton`, sharing the `["favorites"]` query-cache key, so the row disappears live as `shows` shrinks.

## Known limitation (flagging, not fixing here)

`useFavoriteShows`'s `isError` is `results.some(isError)` across independent per-show queries. A partial failure (e.g. 3 of 4 favorites load, 1 network blip) leaves `isPending=false`, `isError=true`, `hasData=true` — the branch order above renders the successful shows and the failed one is silently dropped, with no error indicator. Treated as an acceptable degradation (a shorter list beats blocking the whole screen on one bad item), not a bug to fix here — revisit if it proves confusing in practice.

## Conventions followed

- Match [biome.json](../../biome.json): double quotes, semicolons, trailing commas, `organizeImports: "on"`.
- `@/*` path alias, not relative `../`.
- Function declarations, not arrow consts.
- AGENTS.md's `IProps` prefix and props-typed-in-signature convention followed in `Empty`.
- Near-zero comments — no new comments added; existing `combine` comment in `useFavoriteShows.ts` left as-is since it still applies.

## Out of scope

The favorites-count badge/header (`_layout.tsx`, `ScreenTitle`) is bullet 15 in `docs/10_favorites.md` — a separate change, see [favorites-count.md](./favorites-count.md).

## Verification

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — Biome clean.
3. Manual smoke test (`npm start`): favorite 2–3 shows from the List tab, open Favorites, confirm they render through `ShowList` with working heart toggles and tap-through to detail; un-favorite all of them and confirm the `Empty` state appears; toggle airplane mode and favorite a show not already cached to confirm `ErrorFeedback` renders with a working "Try Again" once connectivity returns.
4. Check off bullets 12–14 in `docs/10_favorites.md`, referencing this plan.
