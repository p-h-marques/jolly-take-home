import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme";

export default function ErrorFeedback() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Failed to load data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  text: {
    fontSize: 14,
    color: colors.placeholderIcon,
  },
});
