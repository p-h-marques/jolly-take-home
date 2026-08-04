import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  title?: string;
  description?: string;
}

export default function Empty(props: IProps) {
  const {
    title = "No data found",
    description = "Try a different search or\nclear the status filter.",
  } = props;

  return (
    <View style={styles.container}>
      <Ionicons
        name="help-circle-outline"
        size={48}
        color={colors.placeholderBackground}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
