import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { getShows } from "@/api/shows";

export function useShows() {
  return useInfiniteQuery({
    queryKey: ["shows"],
    queryFn: async ({ pageParam, signal }) => {
      try {
        return await getShows(pageParam, signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return [];
        }
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + 1,
    select: (data) => data.pages.flat(),
  });
}
