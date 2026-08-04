# Plan: Split `shows/[id].tsx` into `ShowHeader` + `EpisodeList`

## Context

`src/app/shows/[id].tsx` grew to ~155 lines while implementing episodes-by-season (see `docs/plans/episodes-by-season.md`): it now mixes three concerns in one file — data fetching (`useShow`/`useShowEpisodes`), the show header's presentational JSX (image/placeholder, name, badges, summary), and the `SectionList` orchestration (render functions, season-header styling, episodes loading/error state).

The list screen already splits these same concerns across three layers:
- `src/app/(tabs)/index.tsx` — screen: fetches, decides top-level loading/error/empty
- `src/features/ShowList/index.tsx` — feature: owns the `FlatList` config (render functions, footer states), composes the row component
- `src/components/ShowListItem/index.tsx` — dumb presentational row

This plan applies the same split to the detail screen, so `[id].tsx` shrinks back down to just data-fetching + top-level gating. Per user direction, the header block becomes a **feature** (`src/features/ShowHeader`), not a `components/` entry — unlike `ShowListItem`, it isn't a reusable list row, it's a screen-specific composition, which matches how `features/StatusFilters` and `features/ShowList` are also screen-specific (vs. the generic, reusable pieces in `components/`).

## Files to add

### 0. `docs/plans/detail-screen-refactor.md` (new)

Per [AGENTS.md](../../projects/pessoal/jolly-take-home/AGENTS.md): *"When storing AI plans, use the same exact file used by Claude."* Save this plan file's exact content (this same file, verbatim) to `docs/plans/detail-screen-refactor.md`, same as `docs/plans/episodes-by-season.md` and the rest of that directory.

### 1. `src/features/ShowHeader/index.tsx` (new)

Pure presentational, `{ show: Show }` — everything currently in `[id].tsx`'s `ListHeaderComponent` **except** the "Episodes" heading (that stays with the episode list, see below, since it's the list's lead-in, not part of the show's own info):

- Hero image with placeholder fallback (same `image?.original` guard as today)
- Name, `StatusBadge`, genre `Badge`s
- `stripHtml(show.summary)`

Carries over the `header`/`image`/`title`/`badgesContainer`/`summary` styles from the current `[id].tsx`.

### 2. `src/features/EpisodeList/index.tsx` (new)

Owns the `SectionList` entirely — the feature-level orchestration piece, same role `features/ShowList` plays for the `FlatList`:

```tsx
interface IProps {
  show: Show;
  episodes: Episode[] | undefined;
  status: "pending" | "error" | "success";
  onRetry: () => void;
  headerHeight: number;
}
```

- Computes `sections` via `groupEpisodesBySeason(episodes ?? [])` (`src/lib/groupEpisodesBySeason.ts`, unchanged)
- Module-level `keyExtractor`, `renderItem` (renders `EpisodeListItem` from `src/components/EpisodeListItem`), `renderSectionHeader` (the "Season {n}" bar) — moved as-is from `[id].tsx`
- `ListHeaderComponent`: `<ShowHeader show={show} />` followed by the "Episodes" heading `Text`
- `ListEmptyComponent`: same inline `Loading`/`ErrorFeedback`-on-`status` logic currently in `[id].tsx`, now driven by this component's own `status`/`onRetry` props
- `contentContainerStyle`: `{ paddingTop: headerHeight + 16, paddingBottom: 16 }` — `headerHeight` passed in from the screen since `useHeaderHeight()` is a navigation concern that belongs at the screen level
- Carries over the `wrapper`, `episodesTitle`, `seasonHeader`, `seasonHeaderText` styles from the current `[id].tsx`

## File to rewrite

### `src/app/shows/[id].tsx`

Shrinks to just:

```tsx
export default function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const headerHeight = useHeaderHeight();

  const { data: show, status: showStatus, refetch: refetchShow } = useShow(id);
  const {
    data: episodes,
    status: episodesStatus,
    refetch: refetchEpisodes,
  } = useShowEpisodes(id);

  if (showStatus === "pending") {
    return (
      <View style={styles.fullScreen}>
        <Loading />
      </View>
    );
  }

  if (showStatus === "error") {
    return (
      <View style={styles.fullScreen}>
        <ErrorFeedback onRetry={refetchShow} />
      </View>
    );
  }

  return (
    <EpisodeList
      show={show}
      episodes={episodes}
      status={episodesStatus}
      onRetry={refetchEpisodes}
      headerHeight={headerHeight}
    />
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
});
```

No behavior change versus today — same full-screen loading/error gate on `useShow`, same independent inline loading/error for episodes (now inside `EpisodeList`), same visual output. Pure move, no new logic.

## Doc update

Add a new topic to [docs/09_detail_view.md](../../projects/pessoal/jolly-take-home/docs/09_detail_view.md), after the existing checklist, following its established style (checkbox list, each item noting how it was done + linking the plan):

```markdown
## Refactor — split screen composition

`shows/[id].tsx` grew large after the episodes-by-season work; split to match the `screen → feature → component` layering already used by the list screen (`(tabs)/index.tsx` → `features/ShowList` → `components/ShowListItem`).

- [ ] Extract the show header block into `src/features/ShowHeader/index.tsx`
- [ ] Extract the `SectionList` orchestration into `src/features/EpisodeList/index.tsx`
- [ ] Reduce `src/app/shows/[id].tsx` to data-fetching + top-level loading/error gating
```

Plan: [here](./plans/detail-screen-refactor.md).

## Verification

1. `npx tsc --noEmit` — new/moved files type-check.
2. `npm run lint:fix` (Biome) — clean, imports organized.
3. `npm start`, re-open the same detail screen used to verify episodes-by-season (e.g. TVMaze id `1`) and confirm pixel-identical output: header, season groups, right-aligned dates, and both independent loading/error states (full-screen for the header query, inline for episodes) still behave the same as before the refactor.
