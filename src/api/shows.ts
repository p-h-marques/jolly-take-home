import { get } from "@/api/client";
import type { Episode, SearchResult, Show } from "@/api/types";

export function getShows(page: number, signal?: AbortSignal): Promise<Show[]> {
  return get<Show[]>("/shows", { page }, signal);
}

export function searchShows(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  return get<SearchResult[]>("/search/shows", { q: query }, signal);
}

export function getShowEpisodes(
  showId: number | string,
  opts?: { specials?: boolean },
  signal?: AbortSignal,
): Promise<Episode[]> {
  return get<Episode[]>(
    `/shows/${showId}/episodes`,
    opts?.specials ? { specials: 1 } : undefined,
    signal,
  );
}
