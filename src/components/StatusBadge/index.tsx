import { Pressable, StyleSheet, Text } from "react-native";
import type { ShowAllStatus } from "@/api/types";
import { colors } from "@/styles/theme";

interface IProps {
  inactive?: boolean;
  onPress?: () => void;
  type: ShowAllStatus;
}

export default function StatusBadge(props: IProps) {
  const { inactive, onPress, type } = props;

  const backgroundColor = inactive
    ? colors.badge.inactiveBorder
    : colors.badge.status[type];

  const textColor = inactive ? colors.badge.inactiveText : "#fff";

  const borderColor = inactive ? colors.badge.inactiveBorder : "transparent";

  return (
    <Pressable
      style={{ ...styles.container, backgroundColor, borderColor }}
      onPress={onPress}
    >
      <Text style={{ ...styles.text, color: textColor }}>{type}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
