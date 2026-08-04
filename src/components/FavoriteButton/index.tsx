import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable } from "react-native";
import { colors } from "@/styles/theme";

interface IProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export default function FavoriteButton(props: IProps) {
  const { isFavorite, onToggle } = props;

  const iconName = isFavorite ? "heart" : "heart-outline";

  const iconColor = isFavorite ? colors.primary : colors.placeholderBackground;

  return (
    <Pressable onPress={onToggle} hitSlop={8} style={{ padding: 8 }}>
      <Ionicons name={iconName} size={20} color={iconColor} />
    </Pressable>
  );
}
