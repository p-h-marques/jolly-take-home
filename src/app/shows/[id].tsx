import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import StatusBadge from "@/components/StatusBadge";
import { useShow } from "@/hooks/useShow";
import { useShowEpisodes } from "@/hooks/useShowEpisodes";
import { stripHtml } from "@/lib/stripHtml";

export default function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const headerHeight = useHeaderHeight();

  const { data: show, status: showStatus } = useShow(id);

  const { data: episodes, status: episodesStatus } = useShowEpisodes(id);

  const isLoading = showStatus === "pending" || episodesStatus === "pending";

  return (
    <View
      style={{
        ...styles.wrapper,
        paddingTop: headerHeight + 16,
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <View style={styles.container}>
          {show?.image?.original && (
            <Image
              source={{ uri: show?.image?.original }}
              contentFit="cover"
              style={styles.image}
            />
          )}

          <Text style={styles.title}>{show?.name}</Text>

          <View style={styles.badgesContainer}>
            {show?.status && <StatusBadge type={show?.status} />}

            {show?.genres?.map((genre) => (
              <Badge key={genre} text={genre} />
            ))}
          </View>

          <Text style={styles.summary}>{stripHtml(show?.summary)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  container: {
    gap: 8,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
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
