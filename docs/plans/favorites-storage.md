# Plan: `favoritesStorage` + `useFavorites` hook (Favorites, roadmap step 5)

## Context

Next checklist items of [docs/10_favorites.md](../10_favorites.md) (roadmap step 5): the `@react-native-async-storage/async-storage` dependency is already installed manually. Missing pieces are the persistence layer and the hook screens/components will use to read and toggle favorites.

Favorites are just a list of show IDs (per [04_tech_decisions.md](../04_tech_decisions.md)), so `favoritesStorage.ts` stays a thin, "dumb" persistence module with no add/remove logic — same split already used between [src/api/shows.ts](../../src/api/shows.ts) (raw HTTP calls) and the hooks layer (query shaping).

`useFavorites` wraps it with TanStack Query so favorites state lives in the same cache mechanism as every other piece of state in the app (`useShows`, `useShow`, etc.), instead of introducing Context or a separate store — this was already the decision recorded in `docs/10_favorites.md`.

Two existing hooks define the pattern to follow:
- [src/hooks/useShow.ts](../../src/hooks/useShow.ts) — plain `useQuery`.
- [src/lib/groupEpisodesBySeason.ts](../../src/lib/groupEpisodesBySeason.ts) — pure `src/lib` module, function declaration, no class.

No existing hook in the codebase has a mutation yet, so `useFavorites` is the first one — follows the standard TanStack Query `useMutation` shape, nothing project-specific to match there.

## Files to create

### 1. `src/lib/favoritesStorage.ts` (new)

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favorites";

export async function getFavoriteIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveFavoriteIds(ids: number[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}
```

- No try/catch around `getItem`/`setItem`: nothing else in the app writes to this key, so a parse failure isn't a real scenario to guard against — consistent with how `src/api/client.ts` doesn't wrap `fetch` beyond the `response.ok` check.
- `saveFavoriteIds` takes the full next array rather than a single id — keeps add/remove logic (and the optimistic-update math) in the hook, not the storage module.

### 2. `src/hooks/useFavorites.ts` (new)

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavoriteIds, saveFavoriteIds } from "@/lib/favoritesStorage";

const FAVORITES_QUERY_KEY = ["favorites"];

export function useFavorites() {
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], status, error } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: getFavoriteIds,
  });

  const { mutate: persistFavoriteIds } = useMutation({
    mutationFn: saveFavoriteIds,
    onMutate: (nextIds: number[]) => {
      const previousIds = queryClient.getQueryData<number[]>(FAVORITES_QUERY_KEY);
      queryClient.setQueryData(FAVORITES_QUERY_KEY, nextIds);
      return { previousIds };
    },
    onError: (_error, _nextIds, context) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEY, context?.previousIds);
    },
  });

  function isFavorite(id: number) {
    return favoriteIds.includes(id);
  }

  function toggleFavorite(id: number) {
    const nextIds = isFavorite(id)
      ? favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...favoriteIds, id];
    persistFavoriteIds(nextIds);
  }

  return { favoriteIds, isFavorite, toggleFavorite, status, error };
}
```

- `FAVORITES_QUERY_KEY` extracted as a constant (unlike `useShow`'s inline `["show", id]`) because it's read from three places here (`useQuery`, `onMutate`, `onError`) — inlining would risk a typo silently breaking the optimistic update.
- `onMutate` snapshots the previous cache value and writes the new one immediately, so `ShowListItem`'s/`ShowHeader`'s heart flips instantly on tap; `onError` rolls it back if the (unlikely) `AsyncStorage.setItem` write fails. No `onSettled` invalidation — the optimistic value written on `onMutate` is already the source of truth, no need to re-read from storage after a successful write.
- Function declarations throughout (`isFavorite`, `toggleFavorite`), not arrow consts — matches the rest of the hooks/lib layer.

## Known limitation (flagging, not fixing here)

[src/api/query-client.ts](../../src/api/query-client.ts) globally declares `defaultError: ApiError` for every query in the app. `useFavorites`'s `error` will be typed `ApiError | null` even though a real `AsyncStorage` failure wouldn't actually be an `ApiError` instance. Harmless for now since nothing in this plan renders that `error` — noted here so it isn't mistaken for an intentional type guarantee later if a favorites error UI gets built.

## Conventions to follow

- Match [biome.json](../../biome.json): double quotes, semicolons, trailing commas, `organizeImports: "on"` — run `npm run lint:fix` after writing.
- `@/*` path alias for cross-file imports, not relative `../`.
- Near-zero comments; this plan doc carries the "why".
- AGENTS.md's `IProps`/component conventions don't apply here — neither file is a `.tsx` component.

## Out of scope

`FavoriteButton`, wiring into `ShowListItem`/`ShowHeader`, `useFavoriteShows`, and the Favorites tab itself are later bullets in `docs/10_favorites.md` and not part of this plan.

## Verification

1. `npx tsc --noEmit` — confirms both files type-check.
2. `npm run lint` — Biome clean.
3. Temporary smoke test: call `useFavorites()` from a screen already mounted (e.g. `src/app/(tabs)/index.tsx`), `console.log(favoriteIds)`, call `toggleFavorite(1)` from a temporary button, confirm the id appears, then force-close and reopen the app (`npm start`) to confirm it persisted. Revert the temporary call afterward.
4. Check off the two relevant bullets in `docs/10_favorites.md`, referencing this plan.
