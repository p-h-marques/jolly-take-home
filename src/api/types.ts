export type ShowStatus = "Running" | "Ended" | "To Be Determined";

export interface ImageSet {
  medium: string;
  original: string;
}

// Fields are scoped to what docs/03_wireframes.png renders (list, detail,
// favorites) — not the full TVMaze show shape. Extend only when a screen
// actually needs more.
export interface Show {
  id: number;
  name: string;
  status: ShowStatus;
  genres: string[];
  image: ImageSet | null;
  summary: string | null;
}

// /search/shows wraps each match as { score, show }; score isn't rendered
// anywhere in the UI (results already arrive relevancy-sorted), so only
// `show` is kept here.
export interface SearchResult {
  show: Show;
}

export interface Episode {
  id: number;
  season: number;
  number: number;
  name: string;
  airdate: string;
}
