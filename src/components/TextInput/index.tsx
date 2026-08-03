import Ionicons from "@react-native-vector-icons/ionicons";
import {
  Pressable,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function TextInput(props: IProps) {
  const { value, onChangeText, placeholder = "Search shows" } = props;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color={colors.placeholderIcon} />

        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholderIcon}
          style={styles.input}
          returnKeyType="search"
          clearButtonMode="never"
        />

        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.placeholderIcon}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.placeholderBackground,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
