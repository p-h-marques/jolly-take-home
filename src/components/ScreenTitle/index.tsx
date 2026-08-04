import { StyleSheet, Text, View } from "react-native";

interface IProps {
  title: string;
  count?: number;
}

export default function ScreenTitle(props: IProps) {
  const { title, count } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {count !== undefined && <Text style={styles.counter}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  counter: {
    fontSize: 16,
  },
});
