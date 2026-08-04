import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Show } from "@/api/types";
import StatusBadge from "@/components/StatusBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { colors } from "@/styles/theme";
import FavoriteButton from "../FavoriteButton";

interface IProps {
  show: Show;
}

// Thumbnail (56) + vertical padding (12 top + 12 bottom) + bottom border (1)
// from `styles` below — kept in sync manually. Consumed by the list
// screen's `getItemLayout` so FlatList can skip per-row measurement.
export const ITEM_HEIGHT = 81;

function ShowListItem(props: IProps) {
  const { show } = props;

  const { isFavorite, toggleFavorite } = useFavorites();

  const isShowFavorite = isFavorite(show.id);

  return (
    <View style={styles.container}>
      {show.image ? (
        <Image
          source={{ uri: show.image.medium }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.placeholder]}>
          <Ionicons
            name="image-outline"
            size={24}
            color={colors.placeholderIcon}
          />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {show.name}
        </Text>
        <StatusBadge type={show.status} />
      </View>

      <FavoriteButton
        isFavorite={isShowFavorite}
        onToggle={() => toggleFavorite(show.id)}
      />
    </View>
  );
}

export default memo(ShowListItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.placeholderBackground,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
});
