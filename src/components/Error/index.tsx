import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, View } from "react-native";
import Button from "@/components/Button";
import { colors } from "@/styles/theme";

interface IProps {
  onRetry?: () => void;
}

export default function ErrorFeedback(props: IProps) {
  const { onRetry } = props;

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={styles.title}>Could not load data</Text>
      <Text style={styles.description}>
        Something went wrong while fetching data. Check your connection and try
        again.
      </Text>

      {onRetry && <Button title="Try Again" onPress={onRetry} />}
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
