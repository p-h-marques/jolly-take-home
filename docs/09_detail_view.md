# Detail View — Action Plan

Action plan for [step 4 of the roadmap](05_roadmap.md).

- [x] Document `GET /shows/:id` in [02_tv_maze_api.md](02_tv_maze_api.md) and `bruno/Shows/Get Show.bru`: Done manually
- [x] `getShow(id)` in `src/api/shows.ts`: `GET /shows/:id` for the show header (name, image, status, genres, summary)
- [x] `useShow(id)` hook wrapping `getShow` (`src/hooks/useShow.ts`): AI generated, plan [here](./plans/show-hooks.md)
- [x] `useShowEpisodes(id)` hook wrapping the existing `getShowEpisodes` (`src/api/shows.ts`) in `src/hooks/useShowEpisodes.ts`: AI generated, plan [here](./plans/show-hooks.md)
- [x] Replace the `src/app/shows/[id].tsx` stub with the real screen, composing the two hooks above: Done Manually
- [x] Show header: hero image (placeholder for `image: null`, same pattern as `ShowListItem`), name, status badge, summary — rendered once `useShow` resolves: Done Manually
- [x] Strip HTML tags from `summary` before rendering (TVMaze returns it as sanitized HTML, e.g. `<p>...</p>`): Helped by AI
- [x] Genre tags: decide whether to extend `Badge` to accept an arbitrary label (genres aren't a `ShowStatus`, so `Badge`'s `type` prop can't be reused as-is) or add a small neutral `Chip` component reusing its inactive style: Done manually
- [x] Group `Episode[]` by `season` (already in airing order from the API) and render via `SectionList`, one section per season, fully expanded, in order — keeps the show header as `ListHeaderComponent` instead of nesting a list inside a `ScrollView`: AI generated, plan [here](./plans/episodes-by-season.md)
- [x] Season section header row (`renderSectionHeader`) and episode rows (`S{season}E{number} · {name}`, formatted `airdate` right-aligned): AI generated, plan [here](./plans/episodes-by-season.md)
- [x] Initial loading state: full-screen spinner while `useShow` is pending (reuse `Loading`): AI generated, plan [here](./plans/episodes-by-season.md)
- [x] Error state: message + retry if `useShow` fails (reuse `ErrorFeedback`), full-screen since there's nothing else to show yet: AI generated, plan [here](./plans/episodes-by-season.md)
- [x] Episodes loading/error state: independent of the header — inline spinner/retry while/if `useShowEpisodes` is pending/fails, header still renders regardless: AI generated, plan [here](./plans/episodes-by-season.md)
- [ ] Favorite toggle on this screen is deferred to [step 5 of the roadmap](05_roadmap.md) (Favorites) — no heart icon here yet, matching `ShowListItem` which also doesn't render one until that step

## Refactor — split screen composition

`shows/[id].tsx` grew large after the episodes-by-season work; split to match the `screen → feature → component` layering already used by the list screen (`(tabs)/index.tsx` → `features/ShowList` → `components/ShowListItem`).

- [x] Extract the show header block into `src/features/ShowHeader/index.tsx`: AI generated, plan [here](./plans/detail-screen-refactor.md)
- [x] Extract the `SectionList` orchestration into `src/features/EpisodeList/index.tsx`: AI generated, plan [here](./plans/detail-screen-refactor.md)
- [x] Reduce `src/app/shows/[id].tsx` to data-fetching + top-level loading/error gating: AI generated, plan [here](./plans/detail-screen-refactor.md)
