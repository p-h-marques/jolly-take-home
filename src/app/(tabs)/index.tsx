import { Link } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { useShows } from "@/hooks/useShows";

export default function List() {
  const { data: shows, fetchNextPage } = useShows();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={shows}
        keyExtractor={(show) => show.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/shows/[id]", params: { id: item.id } }}
            style={{ padding: 16 }}
          >
            <Text>
              {item.id} - {item.name}
            </Text>
          </Link>
        )}
        onEndReached={() => fetchNextPage()}
      />
    </View>
  );
}
