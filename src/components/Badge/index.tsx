import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  text: string;
}

export default function Badge(props: IProps) {
  const { text } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
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
    borderColor: colors.badge.inactiveBorder,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.badge.inactiveText,
  },
});
