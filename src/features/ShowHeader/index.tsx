import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import type { Show } from "@/api/types";
import Badge from "@/components/Badge";
import FavoriteButton from "@/components/FavoriteButton";
import StatusBadge from "@/components/StatusBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { stripHtml } from "@/lib/stripHtml";

interface IProps {
  show: Show;
}

export default function ShowHeader(props: IProps) {
  const { show } = props;

  const { isFavorite, toggleFavorite } = useFavorites();

  const isShowFavorite = isFavorite(show.id);

  return (
    <View style={styles.header}>
      {show.image?.original && (
        <Image
          source={{ uri: show.image.original }}
          contentFit="cover"
          style={styles.image}
        />
      )}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{show.name}</Text>

        <FavoriteButton
          isFavorite={isShowFavorite}
          onToggle={() => toggleFavorite(show.id)}
        />
      </View>

      <View style={styles.badgesContainer}>
        <StatusBadge type={show.status} />

        {show.genres.map((genre) => (
          <Badge key={genre} text={genre} />
        ))}
      </View>

      <Text style={styles.summary}>{stripHtml(show.summary)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingHorizontal: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
  },
});
