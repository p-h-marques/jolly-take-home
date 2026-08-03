# JOLLY TV

Show Explorer — a small app for browsing TV shows using the free, public [TVMaze API](https://www.tvmaze.com/api) (no key, no auth). This is a take-home assignment; see [docs/01_objective.md](docs/01_objective.md) for the full brief.

## Structure

- `bruno`: API docs with TV Maze API requests (list/search shows, list episodes) — importable into [Bruno](https://www.usebruno.com/)
- `docs`: documentation about the project
  - [01_objective.md](docs/01_objective.md) — assignment brief
  - [02_tv_maze_api.md](docs/02_tv_maze_api.md) — TVMaze API endpoints used, with example responses
  - `03_wireframes.png` — wireframes for the three screens (list, detail, favorites)
  - [04_tech_decisions.md](docs/04_tech_decisions.md) — technical decisions made before starting development
  - [05_roadmap.md](docs/05_roadmap.md) — high-level development roadmap

## Project structure

```txt
jolly-app
├── src
│   ├── app                             # Expo Router routes
│   │   ├── (tabs)
│   │   │   ├── index.tsx               # List — search & filter
│   │   │   └── favorites.tsx
│   │   └── show
│   │       └── [id].tsx                # Detail (stacked, outside the tabs)
│   ├── api                             # HTTP client & TVMaze requests
│   │   ├── client.ts
│   │   ├── shows.ts
│   │   └── types.ts                    # Show, Episode, SearchResult...
│   ├── components
│   │   └── ui                          # Generic reusable primitives (Button, Chip, EmptyState...)
│   ├── hooks                           # Data-fetching & screen-logic hooks (e.g. useShows)
│   ├── lib                             # Utility functions & config
│   └── styles
│       └── theme.ts                    # Centralized color definitions
```

## Features

- **List view** — infinitely-scrolling list of shows (`GET /shows?page=`), showing name, image, and status. Handles loading, error, and empty states.
- **Search & filter** — search shows by name (`GET /search/shows?q=`) and filter by status (Running / Ended / To Be Determined).
- **Detail view** — show details plus its episodes (`GET /shows/:id/episodes`), grouped by season.
- **Favorites** — favorite/unfavorite shows; favorites persist across reloads (local storage), have their own view, and a visible count.

## API

All data comes from the public TVMaze API (`https://api.tvmaze.com`, no auth required), rate-limited to ~20 requests per 10 seconds per IP. See [docs/02_tv_maze_api.md](docs/02_tv_maze_api.md) for endpoint details and example responses, and the `bruno/` collection for ready-to-run requests.

## Developing steps

TBD
