import { View } from "react-native";
import Empty from "@/components/Empty";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import ShowList from "@/features/ShowList";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const {
    data: shows,
    hasNextPage,
    isFetching,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useShows();

  const initialLoading = status === "pending" || isRefetching;
  const hasData = !!shows?.length;

  return (
    <View style={{ flex: 1 }}>
      {initialLoading && <Loading text="Loading..." />}

      {status === "error" && !initialLoading && !hasData && (
        <ErrorFeedback onRetry={refetch} />
      )}

      {status === "success" && !initialLoading && !hasData && <Empty />}

      {!initialLoading && hasData && (
        <ShowList
          shows={shows}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          shouldFetchNextPage={hasNextPage && !isFetching && !isError}
          isNextPageError={isError}
        />
      )}
    </View>
  );
}
