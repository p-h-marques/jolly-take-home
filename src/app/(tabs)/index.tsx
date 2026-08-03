import { useState } from "react";
import { Keyboard, Pressable } from "react-native";
import type { ShowAllStatus } from "@/api/types";
import Empty from "@/components/Empty";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import TextInput from "@/components/TextInput";
import ShowList from "@/features/ShowList";
import StatusFilters, { filterShowsByStatus } from "@/features/StatusFilters";
import { useSearchShows } from "@/hooks/useSearchShows";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const [input, setInput] = useState("");
  const isSearchActive = input.trim().length > 0;

  const [status, setStatus] = useState<ShowAllStatus[]>([]);

  const {
    data: listShows,
    hasNextPage,
    isFetching: isListFetching,
    isError: isListError,
    fetchNextPage,
    isFetchingNextPage,
    status: listStatus,
    refetch: refetchList,
    isRefetching,
  } = useShows();

  const {
    data: searchResults,
    status: searchStatus,
    fetchStatus: searchFetchStatus,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchShows(input);

  const shows = isSearchActive ? searchResults : listShows;
  const hasData = !!shows?.length;

  const initialLoading = isSearchActive
    ? searchStatus === "pending" && searchFetchStatus === "fetching"
    : listStatus === "pending" || isRefetching;

  const isError = isSearchActive ? isSearchError : listStatus === "error";
  const refetch = isSearchActive ? refetchSearch : refetchList;

  const isEmpty = isSearchActive
    ? searchStatus === "success" && !hasData
    : listStatus === "success" && !hasData;

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <TextInput value={input} onChangeText={setInput} />

      <StatusFilters status={status} setStatus={setStatus} />

      {initialLoading && <Loading text="Loading..." />}

      {isError && !initialLoading && !hasData && (
        <ErrorFeedback onRetry={refetch} />
      )}

      {isEmpty && !initialLoading && <Empty />}

      {!initialLoading && hasData && (
        <ShowList
          shows={filterShowsByStatus(shows, status)}
          fetchNextPage={isSearchActive ? undefined : fetchNextPage}
          isFetchingNextPage={isSearchActive ? false : isFetchingNextPage}
          shouldFetchNextPage={
            isSearchActive
              ? false
              : hasNextPage && !isListFetching && !isListError
          }
          isNextPageError={isSearchActive ? false : isListError}
        />
      )}
    </Pressable>
  );
}
