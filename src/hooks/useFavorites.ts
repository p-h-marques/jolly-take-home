import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavoriteIds, saveFavoriteIds } from "@/lib/favoritesStorage";

const FAVORITES_QUERY_KEY = ["favorites"];

export function useFavorites() {
  const queryClient = useQueryClient();

  const {
    data: favoriteIds = [],
    status,
    error,
  } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: getFavoriteIds,
  });

  const { mutate: persistFavoriteIds } = useMutation({
    mutationFn: saveFavoriteIds,
    onMutate: (nextIds: number[]) => {
      const previousIds =
        queryClient.getQueryData<number[]>(FAVORITES_QUERY_KEY);
      queryClient.setQueryData(FAVORITES_QUERY_KEY, nextIds);
      return { previousIds };
    },
    onError: (_error, _nextIds, context) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEY, context?.previousIds);
    },
  });

  function isFavorite(id: number) {
    return favoriteIds.includes(id);
  }

  function toggleFavorite(id: number) {
    const nextIds = isFavorite(id)
      ? favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...favoriteIds, id];
    persistFavoriteIds(nextIds);
  }

  return { favoriteIds, isFavorite, toggleFavorite, status, error };
}
