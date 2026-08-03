import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme";

export default function Empty() {
  return (
    <View style={styles.container}>
      <Ionicons
        name="help-circle-outline"
        size={48}
        color={colors.placeholderBackground}
      />
      <Text style={styles.title}>No data found</Text>
      <Text style={styles.description}>
        Try a different search or{"\n"}clear the status filter.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.placeholderIcon,
    width: "70%",
    textAlign: "center",
  },
});
