import { useInfiniteQuery } from "@tanstack/react-query";
import { getShows } from "@/api/shows";

export function useShows() {
  return useInfiniteQuery({
    queryKey: ["shows"],
    queryFn: ({ pageParam, signal }) => getShows(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
      lastPageParam + 1,
    select: (data) => data.pages.flat(),
  });
}
