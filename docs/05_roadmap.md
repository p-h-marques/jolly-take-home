# Development Roadmap

High-level plan, based on [01_objective.md](01_objective.md) and [04_tech_decisions.md](04_tech_decisions.md). Steps are meant to be sequential, each one shippable/testable on its own.

## 1. Project setup - Details [here](./06_project_setup.md)

Expo + TypeScript + Biome scaffolding, Expo Router base structure (tabs: List/Favorites), API client base config.

## 2. List view - Details [here](./07_list_view.md)

`GET /shows?page=` with infinite scroll. Loading, error, and empty states.

## 3. Search & filter - Details [here](./08_search_filter_shows.md)

`GET /search/shows?q=` with debounce, plus status filter (Running / Ended / To Be Determined). Response shapes from `/shows` and `/search/shows` are reconciled per-hook via `select`, not a separate normalization layer. `Badge` component creation to be used into `ShowListItem` and filters area.

## 4. Detail view - Details [here](./09_detail_view.md)

Show details screen with `GET /shows/:id/episodes`, episodes grouped by season.

## 5. Favorites - Details [here](./10_favorites.md)

Favorite/unfavorite action, persisted with AsyncStorage, dedicated Favorites tab with count, favorites count in tab header.

## 6. Unit tests

A few targeted unit tests, per [04_tech_decisions.md](04_tech_decisions.md) — mainly the status-filter combination logic (`filterShowsByStatus`, `src/features/StatusFilters/index.test.ts`).

## 7. Polish & submission

Review UI consistency, edge cases (empty search, no favorites, API errors), finish README (run instructions, trade-offs, AI usage), final testing pass.
