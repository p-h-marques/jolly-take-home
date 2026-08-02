import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Show detail</Text>
      <Text>id: {id}</Text>
    </View>
  );
}
