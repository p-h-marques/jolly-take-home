# Project Setup — Action Plan

Action plan for [step 1 of the roadmap](05_roadmap.md).

- [x] Initialize Expo project: Done manually
- [x] Configure Biome (lint + format), remove default template ESLint/Prettier: Done manualy
- [x] Define project folder structure (components, screens/routes, services/api, hooks, types, etc.): Helped by AI
- [x] Set up Expo Router with base tabs structure (List / Favorites): AI generated
- [x] Create base API client pointing to TVMaze: `src/api/client.ts`, `types.ts`, `shows.ts`: AI generated, plan [here](./plans/client-layer.md)
- [x] Set up env/config variables, if needed: N/A — TVMaze needs no key/auth, base URL is a fixed constant
- [x] Set up TanStack Query (provider, client): AI generated, plan [here](./plans/tanstack-query-layer.md)
- [ ] Set up unit testing library
- [ ] Adjust `.tool-versions`/package.json scripts (dev, lint, format, test)
- [ ] Initial scaffolding commit
