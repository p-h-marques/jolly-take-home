import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import EpisodeList from "@/features/EpisodeList";
import { useShow } from "@/hooks/useShow";
import { useShowEpisodes } from "@/hooks/useShowEpisodes";

export default function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;

  const { data: show, status: showStatus, refetch: refetchShow } = useShow(id);

  const {
    data: episodes,
    status: episodesStatus,
    refetch: refetchEpisodes,
  } = useShowEpisodes(id);

  if (showStatus === "pending") {
    return (
      <View style={styles.fullScreen}>
        <Loading />
      </View>
    );
  }

  if (showStatus === "error") {
    return (
      <View style={styles.fullScreen}>
        <ErrorFeedback onRetry={refetchShow} />
      </View>
    );
  }

  return (
    <EpisodeList
      show={show}
      episodes={episodes}
      status={episodesStatus}
      onRetry={refetchEpisodes}
      headerHeight={headerHeight}
    />
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
});
