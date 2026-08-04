# Plan: Favorites count — tab badge + header (Favorites, roadmap step 5)

## Context

Last checklist item of [docs/10_favorites.md](../10_favorites.md) (roadmap step 5), bullet 15: show the favorites count as a badge on the tab bar's heart icon and next to "Favorites" in the header. Unlike bullets 12–14 (see [favorites-tab.md](./favorites-tab.md)), this is a separate concern touching different files (`_layout.tsx`, `ScreenTitle`) with no dependency on the tab's own data fetch.

`src/components/Badge` already exists as a generic pill (`{ text: string }`) and is exactly the shape needed next to the header title — reused rather than inventing new styling, matching how `docs/10_favorites.md` bullet 8 already describes `FavoriteButton` following "the same pattern as `Badge`/`StatusBadge`".

## Files changed

### 1. `src/components/ScreenTitle/index.tsx` (edit — small, additive)

```tsx
import { StyleSheet, Text, View } from "react-native";
import Badge from "@/components/Badge";

interface IProps {
  title: string;
  count?: number;
}

export default function ScreenTitle(props: IProps) {
  const { title, count } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {count !== undefined && <Badge text={String(count)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
```

- `count` is optional; the List tab's existing `<ScreenTitle title="Jolly TV" />` usage is unaffected.
- `ScreenTitle`'s outer `<View>` previously had no style at all — `styles.container` with `flexDirection: "row"` is required so the title and badge sit side by side instead of stacking (RN's default `flexDirection` is `"column"`).

### 2. `src/app/(tabs)/_layout.tsx` (edit — small, additive)

```tsx
import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import ScreenTitle from "@/components/ScreenTitle";
import { useFavorites } from "@/hooks/useFavorites";
import { colors } from "@/styles/theme";

export default function TabsLayout() {
  const { favoriteIds } = useFavorites();
  const favoritesBadge =
    favoriteIds.length > 0 ? favoriteIds.length : undefined;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ /* unchanged */ }} />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitle: () => (
            <ScreenTitle title="Favorites" count={favoritesBadge} />
          ),
          headerTitleAlign: "left",
          headerStyle: { backgroundColor: "transparent" },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarBadge: favoritesBadge,
        }}
      />
    </Tabs>
  );
}
```

- **`useFavorites()`, not `useFavoriteShows()`.** `(tabs)/_layout.tsx` is the root `Tabs` navigator — it mounts once at app boot and persists for the app's lifetime, it is not remounted on tab switches. `useFavoriteShows()` would fire one `getShow` HTTP request per favorited show the instant the app opens, regardless of whether the user ever opens the Favorites tab. `useFavorites()` is just the already-cheap AsyncStorage-backed `["favorites"]` read that every `FavoriteButton` instance already triggers elsewhere in the app — no new cost.
- **One shared `favoritesBadge` value feeds both `tabBarBadge` and `ScreenTitle`'s `count`.** `tabBarBadge` renders a literal "0" if given the number `0` (React Navigation doesn't auto-hide it), so both need to be `undefined` at zero favorites — computing them separately risked the tab icon hiding its badge while the header still showed "0". Reusing one value also avoids a boot-time flash: `favoriteIds` defaults to `[]` while the AsyncStorage read is in flight (`useFavorites.ts`: `data: favoriteIds = []`), so the shared value goes `undefined → undefined → real count`, never flashing a `0`.
- Bottom-tabs defaults to `lazy: true`, so `favorites.tsx`'s own body (and its `useFavoriteShows()` call) still only mounts the first time the user taps into that tab — this layout-level `useFavorites()` call doesn't change that; it's one more subscriber to the already-shared `["favorites"]` query.

## Conventions followed

- Match [biome.json](../../biome.json): double quotes, semicolons, trailing commas, `organizeImports: "on"` (`npm run lint` clean after `npx biome check --write` reformatted the multi-line ternary).
- `@/*` path alias, not relative `../`.
- AGENTS.md's `IProps` prefix and props-typed-in-signature convention followed in `ScreenTitle`.
- Reused `Badge` rather than adding new pill styling.
- Near-zero comments — none added; the two bullet points above live in this doc instead, not inline.

## Out of scope

The Favorites tab's own data/loading/error/empty rendering is bullets 12–14, see [favorites-tab.md](./favorites-tab.md) — independent of this change, no shared files.

## Verification

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — Biome clean.
3. Manual smoke test (`npm start`): favorite a couple of shows, confirm the tab-bar heart icon shows a matching numeric badge and the header shows "Favorites" plus the same count as a pill; un-favorite everything and confirm both disappear (not "0"); force-close and reopen the app with favorites already saved and confirm no flash of "0" in the header before the real count appears.
4. Check off bullet 15 in `docs/10_favorites.md`, referencing this plan.
