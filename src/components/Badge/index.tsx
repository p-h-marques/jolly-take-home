import { StyleSheet, Text, View } from "react-native";
import type { ShowStatus } from "@/api/types";
import { colors } from "@/styles/theme";

interface IProps {
  inactive?: boolean;
  type: ShowStatus | "all";
}

export default function Badge(props: IProps) {
  const { inactive, type } = props;

  const backgroundColor = inactive
    ? colors.badge.inactiveBorder
    : colors.badge.status[type];

  const textColor = inactive ? colors.badge.inactiveText : "#fff";

  const borderColor = inactive ? colors.badge.inactiveBorder : "transparent";

  return (
    <View style={{ ...styles.container, backgroundColor, borderColor }}>
      <Text style={{ ...styles.text, color: textColor }}>{type}</Text>
    </View>
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
