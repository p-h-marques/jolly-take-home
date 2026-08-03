import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function Button(props: IProps) {
  const { title, onPress, disabled } = props;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
