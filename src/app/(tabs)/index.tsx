import { useScrollToTop } from "@react-navigation/native";
import { Link } from "expo-router";
import { useRef } from "react";
import { FlatList, View } from "react-native";
import Loading from "@/components/Loading";
import ShowListItem from "@/components/ShowListItem";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const { data: shows, fetchNextPage, isFetchingNextPage } = useShows();
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={shows}
        keyExtractor={(show) => show.id.toString()}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/shows/[id]", params: { id: item.id } }}>
            <ShowListItem show={item} />
          </Link>
        )}
        onEndReached={() => fetchNextPage()}
        ListFooterComponent={() =>
          isFetchingNextPage && <Loading text="Loading more..." />
        }
      />
    </View>
  );
}
