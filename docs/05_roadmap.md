# Development Roadmap

High-level plan, based on [01_objective.md](01_objective.md) and [04_tech_decisions.md](04_tech_decisions.md). Steps are meant to be sequential, each one shippable/testable on its own.

## 1. Project setup - Details [here](./06_project_setup.md)

Expo + TypeScript + Biome scaffolding, Expo Router base structure (tabs: List/Favorites), API client base config.

## 2. List view

`GET /shows?page=` with infinite scroll. Loading, error, and empty states.

## 3. Search & filter

`GET /search/shows?q=` with debounce, plus status filter (Running / Ended / To Be Determined). Normalize the differing response shapes from `/shows` and `/search/shows`.

## 4. Detail view

Show details screen with `GET /shows/:id/episodes`, episodes grouped by season.

## 5. Favorites

Favorite/unfavorite action, persisted with AsyncStorage, dedicated Favorites tab with count.

## 6. Unit tests

A few targeted unit tests, per [04_tech_decisions.md](04_tech_decisions.md) — mainly the search + status-filter normalization logic.

## 7. Polish & submission

Review UI consistency, edge cases (empty search, no favorites, API errors), finish README (run instructions, trade-offs, AI usage), final testing pass.
