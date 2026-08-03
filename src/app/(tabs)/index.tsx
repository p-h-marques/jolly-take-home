import { View } from "react-native";
import Empty from "@/components/Empty";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import ShowList from "@/features/ShowList";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const {
    data: shows,
    fetchNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useShows();

  const initialLoading = status === "pending" || isRefetching;

  const ListComponent = shows?.length ? ShowList : Empty;

  return (
    <View style={{ flex: 1 }}>
      {initialLoading && <Loading text="Loading..." />}

      {status === "error" && !initialLoading && (
        <ErrorFeedback onRetry={refetch} />
      )}

      {status === "success" && !initialLoading && (
        <ListComponent
          shows={shows}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </View>
  );
}
