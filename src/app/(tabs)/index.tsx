import { Text, View } from "react-native";
import Loading from "@/components/Loading";
import ShowList from "@/features/ShowList";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const { data: shows, fetchNextPage, isFetchingNextPage, status } = useShows();

  return (
    <View style={{ flex: 1 }}>
      {status === "pending" && <Loading text="Loading..." />}

      {status === "error" && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "red" }}>
            Failed to load shows.
          </Text>
        </View>
      )}

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
