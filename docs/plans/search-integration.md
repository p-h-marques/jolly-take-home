# Plan: Wire search input + conditional list rendering

## Context

[08_search_filter_shows.md](../08_search_filter_shows.md) (step 3 of the roadmap) has its data-layer items done — `useSearchShows` (debounced), the `Show[]` normalization via `select`, and `Badge` — but the UI-facing items are still unchecked. `TextInput` is already dropped into the List screen (`src/app/(tabs)/index.tsx`) with local `input` state, but that state is a dead end: it's never passed to `useSearchShows`, so typing does nothing. This pass scopes narrowly to just the search-input wiring and switching the list between paginated (`/shows`, infinite scroll) and flat (`/search/shows`) rendering depending on whether a query is active. Status filter (chips, `Badge`-as-filter, combining with search) is explicitly deferred to a later pass.

## Approach

### 1. `src/features/ShowList/index.tsx` (edit)

Make the four pagination-related props optional with safe defaults, instead of creating a second list component. `getItemLayout`, `renderShow`/`ShowListItem`, `keyExtractor`, `useScrollToTop`, and the `FlatList` tuning props are identical between paginated and flat (search) rendering — duplicating them for a separate "SearchResultsList" would just be the same component twice.

```ts
interface ShowListProps {
  shows: Show[] | undefined;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  shouldFetchNextPage?: boolean;
  isNextPageError?: boolean;
}
```

`onEndReached` already guards on `shouldFetchNextPage` (stays inert when `false`/omitted); default `isFetchingNextPage`/`isNextPageError` to `false` so the footer renders `null` in search mode.

### 2. `src/app/(tabs)/index.tsx` (edit) — the core wiring

Call both hooks unconditionally (Rules of Hooks), branch on a single `isSearchActive` flag:

```tsx
const [input, setInput] = useState("");
const isSearchActive = input.trim().length > 0;

const {
  data: listShows, hasNextPage, isFetching: isListFetching, isError: isListError,
  fetchNextPage, isFetchingNextPage, status: listStatus, refetch: refetchList, isRefetching,
} = useShows();

const {
  data: searchResults, status: searchStatus, fetchStatus: searchFetchStatus,
  isError: isSearchError, refetch: refetchSearch,
} = useSearchShows(input);
```

Namespacing (`listStatus`/`searchStatus`, `isListError`/`isSearchError`, etc.) is required — two unrenamed `status`/`isError` pairs in the same component is a bug waiting to happen once both queries are in scope.

Derive the rendered data and states from `isSearchActive`:

- **Data**: `isSearchActive ? (searchResults ?? []) : listShows`.
- **Loading**: paginated case unchanged (`listStatus === "pending" || isRefetching`). Search case: `searchStatus === "pending" && searchFetchStatus === "fetching"` — deliberately *not* loading during the 1s debounce window itself (`fetchStatus === "idle"`, no request in flight yet), since spinning on every keystroke before the debounce fires would flicker.
- **Error**: `isSearchActive ? searchStatus === "error" : listStatus === "error"`, `onRetry` calls `refetchSearch` or `refetchList` respectively.
- **Empty**: `isSearchActive ? searchStatus === "success" && !searchResults?.length : listStatus === "success" && !listShows?.length` — reuses the existing `Empty` component as-is (no copy change needed; its current text already covers "no results" generically enough for this scope — the "clear the status filter" phrase in its copy is a pre-existing hint for the *later* filter pass, not something this pass needs to act on).
- **`ShowList` props**: in search mode, omit pagination props entirely (or pass `shouldFetchNextPage={false}`) — no infinite scroll on flat search results, per the checklist.

## Conventions to follow

- `interface IProps`, typed in the function signature, destructured in the body; `StyleSheet.create` below the component (`AGENTS.md`).
- `@/*` path alias.
- No new dependencies — everything above uses `useState`/existing TanStack Query hooks.
- Reuse `Empty`/`Error`/`Loading` as-is; no new components in this pass.

## Files to change

- `src/features/ShowList/index.tsx` — make 4 pagination props optional
- `src/app/(tabs)/index.tsx` — wire `useSearchShows` into the existing `input` state, branch rendering on `isSearchActive`, namespace both queries' state
- `docs/08_search_filter_shows.md` — check off only the two items this pass covers (search input UI wired to the hook; switching `ShowList` between paginated and flat results) — leave status-filter-related items (chips, combination, and the filter-flavored parts of empty/error copy) unchecked for the later pass

## Verification

- `npx tsc --noEmit` and `npm run lint` (Biome), matching repo conventions.
- Manual pass in Expo (start the dev server, use the List tab):
  - Type a query → results replace the paginated list after the 1s debounce, no infinite-scroll footer appears.
  - Clear the input → paginated list with infinite scroll returns.
  - Search a query with no matches → `Empty` renders.
  - Force a search failure (e.g. airplane mode) → `Error` renders with working retry.

## Out of scope (deferred to a later pass)

- Status filter UI (chips using `Badge`), and combining it with search — remaining unchecked items in `docs/08_search_filter_shows.md`.
- Unit tests (roadmap step 6, separate pass; the status-filter combination logic named in `docs/04_tech_decisions.md` as the test candidate doesn't exist yet in this scope).
- Any change to `useSearchShows` or `useShows` themselves — both are already correct and unchanged by this plan.
