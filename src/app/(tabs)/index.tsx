import { View } from "react-native";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import ShowList from "@/features/ShowList";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const { data: shows, fetchNextPage, isFetchingNextPage, status } = useShows();

  return (
    <View style={{ flex: 1 }}>
      {status === "pending" && <Loading text="Loading..." />}

      {status === "error" && <ErrorFeedback />}

      {status === "success" && (
        <ShowList
          shows={shows}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </View>
  );
}
