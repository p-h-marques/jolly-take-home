import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  text?: string;
}

export default function Loading(props: IProps) {
  const { text = "Loading" } = props;

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.placeholderIcon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
