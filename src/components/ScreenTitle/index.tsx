import { StyleSheet, Text, View } from "react-native";

interface IProps {
  title: string;
}

export default function ScreenTitle(props: IProps) {
  const { title } = props;

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
