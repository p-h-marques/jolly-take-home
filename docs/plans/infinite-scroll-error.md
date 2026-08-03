# Don't lock up the whole list when `fetchNextPage` fails with a real error

## Context

The "end of pagination" 404 has already been handled in [useShows.ts](src/hooks/useShows.ts) (converted into an empty page, no longer raises an error). But a **real** error during scroll (network, 5xx — currently reproduced with the `ApiError(500, ...)` mock on page 3) still propagates as `status === "error"` for the whole query.

In [src/app/(tabs)/index.tsx](src/app/(tabs)/index.tsx:32), `ShowList` is only rendered when `status === "success"`. Since an error on any page also leaves `status` as `"error"`, the entire list — which already had items successfully loaded into `shows` (react-query's cache preserves `data` even after an error) — disappears and is replaced by the full-screen `ErrorFeedback`. That component's retry calls `refetch()`, which restarts the query from scratch (back to `initialPageParam`), losing all scroll progress.

Goal: distinguish "error on initial load" (no data — full-screen error is already the right response) from "error loading more" (data already present — keep the list visible and show the error only in the footer, with a retry that specifically retries the page that failed, without discarding what's already been loaded). No changes to `useShows.ts` — `isError`/`hasNextPage`/`data` already behave the way this UI needs (confirmed by reading the hook: when `fetchNextPage` fails, `data` keeps the pages already fetched successfully, and `hasNextPage` remains `true`, since `getNextPageParam` never advanced to the page that failed).

## Changes

### 1. New component `src/components/FooterError/index.tsx`

Small, meant to fit in a list footer (unlike [Error/index.tsx](src/components/Error/index.tsx), which is `flex: 1` and centered for full-screen use). Follows the same props pattern as [Loading](src/components/Loading/index.tsx) (used today in `ListFooterComponent`) and reuses [Button](src/components/Button/index.tsx) for "Retry":

```tsx
interface IProps {
  onRetry: () => void;
}

export default function FooterError(props: IProps) {
  const { onRetry } = props;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Couldn't load more items.</Text>
      <Button title="Retry" onPress={onRetry} />
    </View>
  );
}
```

Style: `flexDirection: "column"`, `gap`, `paddingVertical` — mirroring the `styles.container`/`styles.text` constants from `Loading`, using colors from `@/styles/theme` (`colors.placeholderIcon` for the text, same palette as `ErrorFeedback`).

### 2. `src/features/ShowList/index.tsx` — footer with 3 states

Add prop `isNextPageError: boolean` to `ShowListProps` (line 38-43) and swap out the `ListFooterComponent` (line 69-71):

```tsx
ListFooterComponent={() => {
  if (isFetchingNextPage) return <Loading text="Loading more..." />;
  if (isNextPageError) return <FooterError onRetry={fetchNextPage} />;
  return null;
}}
```

No local state needed: as soon as `onRetry` calls `fetchNextPage`, `isFetchingNextPage` becomes `true` and the footer itself switches to the spinner — no need to duplicate "retrying" tracking.

### 3. `src/app/(tabs)/index.tsx` — distinguish initial error from pagination error

- Destructure `isError` from `useShows()` (line 9-18).
- Compute `hasData = !!shows?.length` once.
- Full-screen error only when **there is no data**: `status === "error" && !initialLoading && !hasData`.
- Render the list when **there is data**, regardless of `status` having flipped to `"error"` because of a later page: swap the condition from `status === "success"` to `hasData` (keeping `!initialLoading`), and pass `isNextPageError={isError}` to `ShowList`.
- Adjust `shouldFetchNextPage` so it doesn't loop back in when `onEndReached` fires again while the user is sitting at the end of the list after the error: `hasNextPage && !isFetching && !isError`. The manual retry (footer button) keeps working because it calls `fetchNextPage` directly, bypassing this guard.
- `Empty` remains reserved for `status === "success" && !hasData` (a genuinely empty list, no error).

## Affected files

- `src/components/FooterError/index.tsx` (new)
- `src/features/ShowList/index.tsx`
- `src/app/(tabs)/index.tsx`

No changes to `src/hooks/useShows.ts`, `src/api/shows.ts`, or `src/components/Error/index.tsx` (the full-screen error still exists, it just becomes used exclusively for the "no data" case).

## Verification

There's no fetch-mocking infrastructure in the repo (same limitation as before), so verification is manual, using the error mock you already put in `useShows.ts` (`if (pageParam === 3) throw new ApiError(500, "Nmock")`):

1. Run the app, let the first page load normally.
2. Scroll until `fetchNextPage` triggers on the page that returns 500 (adjust the mock to hit during scroll, not on initial load) and confirm that:
   - The list **stays visible** with the items already loaded.
   - The footer shows the error text + "Retry" button (not the full-screen `ErrorFeedback`).
   - Scrolling further doesn't cause repeated automatic calls to `fetchNextPage` (loop) — only the button should trigger a retry.
3. Tap "Retry": the footer should switch to the "Loading more..." spinner and, assuming the mock doesn't block the same page again, complete and resume normal pagination.
4. Remove the mock and confirm that forcing an error on the first page (no data yet) still shows the full-screen `ErrorFeedback` with "Try Again" calling `refetch()`, as it does today.
5. Run `npx tsc --noEmit` to make sure the new types/props check out.
