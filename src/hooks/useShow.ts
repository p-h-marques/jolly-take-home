import { useQuery } from "@tanstack/react-query";
import { getShow } from "@/api/shows";

export function useShow(id: number | string) {
  return useQuery({
    queryKey: ["show", id],
    queryFn: ({ signal }) => getShow(id, signal),
  });
}
