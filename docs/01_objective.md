# Show Explorer — Frontend Take-Home Assignment

## What to build

A small app for browsing TV shows using the free, public [TVMaze API](https://www.tvmaze.com/api) (no key, no auth). Build it in **React (web) or React Native — your choice**. Pick whichever you'd be most proud of.

## Requirements

1. **List view** — an infinitely-scrolling list of shows (load more as the user scrolls, via `GET /shows?page=`) showing at least name, image, and status. Handle loading, error, and empty states.
2. **Search & filter** — search shows by name (`GET /search/shows?q=`) and filter by status (Running / Ended / To Be Determined).
3. **Detail view** — opening a show shows its details *and* its episodes (`GET /shows/:id/episodes`). Bonus if you present episodes grouped by season.
4. **Favorites** — favorite / unfavorite shows; favorites persist across reloads, have their own view, and a visible count.

## Notes

- No design is provided. A clean, simple UI is fine.
- The list (`/shows`) and search (`/search/shows`) endpoints return different response shapes.
- Choose your own libraries and tools.
- TVMaze rate-limits to roughly 20 requests per 10 seconds.

## AI tools

Using AI assistants (Copilot, ChatGPT, Claude, Cursor, etc.) is allowed. In your README, please briefly describe how you used them.

## What to submit

- A link to a **GitHub repo** (make it public, or share access with the contact who sent you this exercise).
- A **README** covering:
  - How to run it locally.
  - Key decisions and trade-offs, and why.
  - What you'd do with more time / what you left out.
  - Your AI-usage disclosure.

If anything is ambiguous, make a reasonable call and note it in your README.
