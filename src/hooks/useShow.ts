import { useQuery } from "@tanstack/react-query";
import { getShow } from "@/api/shows";

export function showQueryKey(id: number | string) {
  return ["show", String(id)] as const;
}

export function useShow(id: number | string) {
  return useQuery({
    queryKey: showQueryKey(id),
    queryFn: ({ signal }) => getShow(id, signal),
  });
}
