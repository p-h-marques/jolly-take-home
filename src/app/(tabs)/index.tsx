import { Link } from "expo-router";
import { FlatList, Text, View } from "react-native";

const MOCK_SHOWS = [
  { id: "169", name: "Breaking Bad" },
  { id: "45209", name: "Severance" },
  { id: "62150", name: "The Bear" },
  { id: "1371", name: "Dark" },
];

export default function List() {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={MOCK_SHOWS}
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
