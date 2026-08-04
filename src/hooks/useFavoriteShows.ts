import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQueries } from "@tanstack/react-query";
import { getShow } from "@/api/shows";
import type { Show } from "@/api/types";
import { useFavorites } from "@/hooks/useFavorites";
import { showQueryKey } from "@/hooks/useShow";

function toShowQuery(id: number): UseQueryOptions<Show> {
  return {
    queryKey: showQueryKey(id),
    queryFn: ({ signal }) => getShow(id, signal),
  };
}

// Stable reference: an inline combine would be a new function every render,
// forcing useQueries to recompute unnecessarily (it compares combine by
// reference to decide whether to re-run it).
function combineFavoriteShows(results: UseQueryResult<Show>[]) {
  return {
    shows: results
      .map((result) => result.data)
      .filter((show): show is Show => show !== undefined),
    isPending: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
  };
}

export function useFavoriteShows() {
  const { favoriteIds, status: favoritesStatus } = useFavorites();

  const { shows, isPending, isError } = useQueries({
    queries: favoriteIds.map(toShowQuery),
    combine: combineFavoriteShows,
  });

  return {
    shows,
    isPending: favoritesStatus === "pending" || isPending,
    isError: favoritesStatus === "error" || isError,
  };
}
