import { useScrollToTop } from "@react-navigation/native";
import { Link } from "expo-router";
import { useRef } from "react";
import { FlatList, Text, View } from "react-native";

const MOCK_FAVORITES = [{ id: "45209", name: "Severance" }];

export default function Favorites() {
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={MOCK_FAVORITES}
        keyExtractor={(show) => show.id}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/shows/[id]", params: { id: item.id } }}
            style={{ padding: 16 }}
          >
            <Text>{item.name}</Text>
          </Link>
        )}
      />
    </View>
  );
}
