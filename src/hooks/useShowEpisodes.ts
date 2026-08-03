import { useQuery } from "@tanstack/react-query";
import { getShowEpisodes } from "@/api/shows";

export function useShowEpisodes(id: number | string) {
  return useQuery({
    queryKey: ["show-episodes", id],
    queryFn: ({ signal }) => getShowEpisodes(id, undefined, signal),
  });
}
