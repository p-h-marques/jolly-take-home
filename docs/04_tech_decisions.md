# Tech Decisions

Technical decisions made before starting development, on top of the stack already chosen (React Native, Expo, TypeScript, Biome).

## Base stack

### [React Native](https://reactnative.dev/docs/getting-started)

Framework for building the app with native components, shared between iOS and Android.

### [Expo](https://docs.expo.dev/)

Toolchain on top of React Native — dev builds, OTA updates, and a large set of first-party native modules (image, storage, etc.) without touching native code directly.

### [TypeScript](https://www.typescriptlang.org/docs/)

Static typing across the app, including the API response shapes (which differ between `/shows` and `/search/shows`).

### [Biome](https://biomejs.dev/)

Single tool for linting and formatting, replacing the usual ESLint + Prettier combo.

## Decisions

### Navigation — [Expo Router](https://docs.expo.dev/router/introduction/)

File-based routing, no manual navigator setup. Fits the wireframes naturally (tabs for List/Favorites, Detail pushed as a stacked screen), and comes with deep linking out of the box.

### Data fetching & caching — [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)

Handles pagination (infinite list), caching, and request state (loading/error) without hand-rolled logic.

### Favorites persistence — [AsyncStorage](https://github.com/react-native-async-storage/async-storage)

Favorites are just a list of show IDs that need to survive reloads — a simple key-value store is proportional to the problem. SQLite/MMKV would be overkill here.

### Theming — Light only

Wireframes only show a light theme. No dark mode for this scope.

### API rate limiting — Debounce only

TVMaze [limits requests to ~20/10s](https://www.tvmaze.com/api#rate-limiting). Search input gets a 1s debounce; no retry/throttle queue on top of that.

### Linting/formatting — Biome only

No additional ESLint plugins layered on top of [Biome](https://biomejs.dev/).

### Testing — Minimal, targeted

Not a full suite — 1–2 tests just to demonstrate testing know-how. Best candidate: the status-filter combination logic (filtering search/list results by `status` client-side). The `/shows` vs `/search/shows` shape difference is handled inline via each hook's `select` and is trivial enough not to warrant its own extraction/test.

### Platform — Mobile only

No web target for this take-home.
