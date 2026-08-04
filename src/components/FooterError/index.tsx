import { StyleSheet, Text, View } from "react-native";
import Button from "@/components/Button";
import { colors } from "@/styles/theme";

interface IProps {
  onRetry: () => void;
}

export default function FooterError(props: IProps) {
  const { onRetry } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Could not load more items.</Text>
      <Button title="Try Again" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
  },
  text: {
    fontSize: 14,
    color: colors.placeholderIcon,
  },
});
