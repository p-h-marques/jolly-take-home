import { Link } from "expo-router";
import { FlatList, View } from "react-native";
import ShowListItem from "@/components/ShowListItem";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const { data: shows, fetchNextPage } = useShows();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={shows}
        keyExtractor={(show) => show.id.toString()}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/shows/[id]", params: { id: item.id } }}>
            <ShowListItem show={item} />
          </Link>
        )}
        onEndReached={() => fetchNextPage()}
      />
    </View>
  );
}
