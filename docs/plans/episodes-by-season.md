# Plan: Episodes grouped by season (Detail view, roadmap step 4 remainder)

## Context

[docs/09_detail_view.md](../../projects/pessoal/jolly-take-home/docs/09_detail_view.md) tracks roadmap step 4. The header half (hero image, title, status badge, genre badges, summary) is already done. The remaining checklist items are the episodes list itself:

- Group `Episode[]` by `season` and render via `SectionList`, one section per season, fully expanded, in order
- Season header row + episode rows (`S{season}E{number} · {name}`, airdate right-aligned)
- Full-screen loading/error for the header (`useShow`)
- Independent inline loading/error for the episodes list (`useShowEpisodes`), with the header still rendering regardless

The wireframe (`docs/03_wireframes.png`, panel 2) confirms the shape: hero image → title/badges/summary → "Episodes" heading → grey "Season N" bar → episode rows (`S1E1 · Pilot` left, `Feb 18, 2022` right). Its caption: *"episodes list shows its own loading/error state independent of the header (header renders as soon as show data resolves) · seasons render fully expanded, in order"*.

Today `src/app/shows/[id].tsx` collapses both queries into one `isLoading` flag and doesn't render episodes at all. This plan replaces that with a `SectionList`-based screen and the two supporting pieces (grouping helper, episode row component), reusing existing `Loading`/`ErrorFeedback` components per the doc's explicit instruction.

## Files to add

### 0. `docs/plans/episodes-by-season.md` (new)

Per [AGENTS.md](../../projects/pessoal/jolly-take-home/AGENTS.md): *"When storing AI plans, use the same exact file used by Claude."* Save this plan file's exact content (this same file, verbatim) to `docs/plans/episodes-by-season.md` — same convention already followed by `docs/plans/show-hooks.md` and the other files in that directory.

### 1. `src/lib/groupEpisodesBySeason.ts` (new)

Pure grouping function, same spirit as `src/lib/stripHtml.ts`. Relies on the API already returning episodes in airing order (noted in the doc), so a single linear pass suffices — no need to sort or use a `Map`:

```ts
import type { Episode } from "@/api/types";

export interface EpisodeSection {
  season: number;
  data: Episode[];
}

export function groupEpisodesBySeason(episodes: Episode[]): EpisodeSection[] {
  const sections: EpisodeSection[] = [];

  for (const episode of episodes) {
    const current = sections[sections.length - 1];
    if (current?.season === episode.season) {
      current.data.push(episode);
    } else {
      sections.push({ season: episode.season, data: [episode] });
    }
  }

  return sections;
}
```

### 2. `src/lib/formatAirdate.ts` (new)

`airdate` is `"YYYY-MM-DD"` (see [docs/02_tv_maze_api.md](../../projects/pessoal/jolly-take-home/docs/02_tv_maze_api.md)). Parsed and formatted as UTC to avoid an off-by-one day shift that `new Date("2022-02-18")` + local-timezone formatting can cause west of UTC:

```ts
export function formatAirdate(airdate: string) {
  const date = new Date(`${airdate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
```

### 3. `src/components/EpisodeListItem/index.tsx` (new)

Same shape as `src/components/ShowListItem/index.tsx`: owns its own horizontal padding/border so the list itself doesn't need to. `memo`-wrapped for the same reason `ShowListItem` is.

```tsx
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Episode } from "@/api/types";
import { formatAirdate } from "@/lib/formatAirdate";
import { colors } from "@/styles/theme";

interface IProps {
  episode: Episode;
}

function EpisodeListItem(props: IProps) {
  const { episode } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.label} numberOfLines={1}>
        S{episode.season}E{episode.number} · {episode.name}
      </Text>
      <Text style={styles.date}>{formatAirdate(episode.airdate)}</Text>
    </View>
  );
}

export default memo(EpisodeListItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    flex: 1,
    fontSize: 15,
  },
  date: {
    fontSize: 13,
    color: colors.placeholderIcon,
  },
});
```

## File to rewrite

### `src/app/shows/[id].tsx`

Restructure around `SectionList` instead of the current single `View` + `isLoading` gate:

- **`sections`**: `useMemo(() => (episodes ? groupEpisodesBySeason(episodes) : []), [episodes])`.
- **Show query pending** (`showStatus === "pending"`): full-screen `Loading`, return early — matches the current behavior, just scoped to `useShow` only instead of both queries.
- **Show query error** (`showStatus === "error"`): full-screen `ErrorFeedback` with `onRetry={refetchShow}`, return early.
- **Show query success**: render the `SectionList`:
  - `sections={sections}`, `keyExtractor={(episode) => episode.id.toString()}`
  - `renderItem`: `EpisodeListItem` (module-level function referencing the memoized component, same stable-reference pattern as `renderShow` in `src/features/ShowList/index.tsx`)
  - `renderSectionHeader`: inline module-level function rendering the grey "Season {season}" bar from the wireframe — season headers are specific to this screen, so no new component directory (parallels how `ShowList` keeps `renderShow`/`getItemLayout` inline while only the reusable row is its own component)
  - `ListHeaderComponent`: the existing header block (image/placeholder, name, `StatusBadge`, genre `Badge`s, stripped summary) plus a new "Episodes" heading — wrapped in a `View` with `paddingHorizontal: 16` since list items own their own horizontal padding instead
  - `ListEmptyComponent`: renders only when `sections` is empty, i.e. exactly while episodes are pending/erroring (or the rare zero-episode show) — independent of the header, which already rendered above via `ListHeaderComponent`:
    - `episodesStatus === "pending"` → `<Loading text="Loading episodes..." />`
    - `episodesStatus === "error"` → `<ErrorFeedback onRetry={refetchEpisodes} />`
    - otherwise → `null` (genuinely zero-episode show; not addressed by the wireframe/doc, not worth a dedicated empty state)
  - `contentContainerStyle`: `{ paddingTop: headerHeight + 16, paddingBottom: 16 }` (no horizontal padding here — items and the header block each own theirs)

`useShow`/`useShowEpisodes` already expose `refetch`/`status`/`error` from `useQuery` — no hook changes needed.

## Doc update

Check off the remaining bullets in `docs/09_detail_view.md`, referencing `./plans/episodes-by-season.md` (mirroring how the header bullets above them cite `plans/show-hooks.md`).

## Verification

1. `npx tsc --noEmit` — new files type-check against `Episode`/`Show`.
2. `npm run lint` (Biome) — clean, imports organized.
3. `npm start`, open a show with multiple seasons (e.g. TVMaze id `1`, "Under the Dome") from the list screen:
   - Header renders immediately once `useShow` resolves.
   - Episodes render grouped by season, fully expanded, in airing order, dates right-aligned and matching TVMaze data.
   - Confirm the two loading/error states are independently triggerable (e.g. temporarily force one query to error) — episodes error/loading must not block or hide the header.
