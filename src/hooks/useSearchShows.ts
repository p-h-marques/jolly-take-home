import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { searchShows } from "@/api/shows";

const SEARCH_DEBOUNCE_MS = 1000;

export function useSearchShows(query: string) {
  const trimmed = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedQuery(trimmed),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [trimmed]);

  return useQuery({
    queryKey: ["search-shows", debouncedQuery],
    queryFn: ({ signal }) => searchShows(debouncedQuery, signal),
    enabled: debouncedQuery.length > 0,
    select: (data) => data.map((result) => result.show),
  });
}
