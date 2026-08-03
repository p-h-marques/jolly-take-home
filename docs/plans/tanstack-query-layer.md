# Set up TanStack Query (provider, client)

## Context

This is the next unchecked item in [docs/06_project_setup.md](../../../home/pedro/projects/pessoal/jolly-take-home/docs/06_project_setup.md): `- [ ] Set up TanStack Query (provider, client)`. It's the last piece of infra before the List view (roadmap step 2) can start doing real data fetching.

`docs/04_tech_decisions.md` already commits to TanStack Query for pagination/infinite-list, caching, and request state. The API layer (`src/api/client.ts`, `shows.ts`, `types.ts`) is already built and was deliberately designed for this: `get<T>()` accepts and forwards an `AbortSignal` specifically so it can be passed straight into a `queryFn`. Nothing consumes it yet.

Currently `src/app/_layout.tsx` has no provider at all — just a bare `<Stack>`. The list/favorites/detail screens (`src/app/(tabs)/index.tsx`, `favorites.tsx`, `src/app/shows/[id].tsx`) are pure UI shells with hardcoded mock arrays; there's no fetch logic to migrate.

**Scope, per user decision:** infrastructure only — `QueryClient` + `QueryClientProvider`. No devtools (mobile-only app, no web target, would need a separate Expo-specific package — skip until it's actually needed). No hooks or screen wiring — that belongs to the List view (roadmap step 2) and Detail view (roadmap step 4), which is also how `docs/plans/client-layer.md` explicitly scoped the API layer PR (client only, no query hooks).

## Steps

1. **Install dependency**
   `npm install @tanstack/react-query`

2. **Create `src/api/query-client.ts`**
   Same directory as `client.ts`/`shows.ts`/`types.ts` — it's part of the API layer, not a generic `lib/`. Export a single `queryClient` instance:
   ```ts
   import { QueryClient } from "@tanstack/react-query";

   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         retry: false,
       },
     },
   });
   ```
   `retry: false` per `docs/04_tech_decisions.md`'s "API rate limiting — Debounce only" decision: no retry/throttle layer anywhere beyond the search debounce.

3. **Wrap the root layout with `QueryClientProvider`**
   Edit [src/app/_layout.tsx](../../../home/pedro/projects/pessoal/jolly-take-home/src/app/_layout.tsx) to import `QueryClientProvider` from `@tanstack/react-query` and the new `queryClient` from `@/api/query-client`, wrapping the existing `<Stack>`:
   ```tsx
   import { QueryClientProvider } from "@tanstack/react-query";
   import { Stack } from "expo-router";
   import { queryClient } from "@/api/query-client";

   export default function RootLayout() {
     return (
       <QueryClientProvider client={queryClient}>
         <Stack>
           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
           <Stack.Screen name="shows/[id]" options={{ title: "Show" }} />
         </Stack>
       </QueryClientProvider>
     );
   }
   ```

4. **Update `docs/06_project_setup.md`**
   Check off `- [x] Set up TanStack Query (provider, client)` with a short note (matching the style of the other checked items, e.g. "AI generated").

## Verification

- `npx tsc --noEmit` — no type errors.
- `npm run lint` — Biome clean (double quotes, semicolons, trailing commas, import ordering — matches existing `src/api/` files).
- `npm start` (or `npm run ios`/`android`) — app boots without a runtime error from the provider wrap; screens still render their current mock data unchanged (no behavior change expected at this step, this is pure infra).

## Not in scope (deferred to later roadmap steps)

- No `useQuery`/`useInfiniteQuery` hooks for `getShows`/`searchShows`/`getShowEpisodes`.
- No wiring of `index.tsx`, `favorites.tsx`, or `shows/[id].tsx` to real data.
- No devtools.
- No `.tool-versions`/package.json scripts changes or scaffolding commit — those are the two remaining separate checklist items after this one.
