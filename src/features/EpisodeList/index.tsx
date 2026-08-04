import { useMemo } from "react";
import { SectionList, StyleSheet, Text } from "react-native";
import type { Episode, Show } from "@/api/types";
import EpisodeListItem from "@/components/EpisodeListItem";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import SeasonHeader from "@/components/SeasonHeader";
import ShowHeader from "@/features/ShowHeader";
import {
  type EpisodeSection,
  groupEpisodesBySeason,
} from "@/lib/groupEpisodesBySeason";

interface IProps {
  show: Show;
  episodes: Episode[] | undefined;
  status: "pending" | "error" | "success";
  onRetry: () => void;
  headerHeight: number;
}

export default function EpisodeList(props: IProps) {
  const { show, episodes, status, onRetry, headerHeight } = props;

  const sections = useMemo(
    () => (episodes ? groupEpisodesBySeason(episodes) : []),
    [episodes],
  );

  return (
    <SectionList
      style={styles.wrapper}
      contentContainerStyle={{
        paddingTop: headerHeight + 16,
        paddingBottom: 16,
      }}
      sections={sections}
      keyExtractor={(episode) => episode.id.toString()}
      renderItem={(props) => <EpisodeListItem episode={props.item} />}
      renderSectionHeader={(info) => (
        <SeasonHeader section={info.section as EpisodeSection} />
      )}
      ListHeaderComponent={
        <>
          <ShowHeader show={show} />
          <Text style={styles.episodesTitle}>Episodes</Text>
        </>
      }
      ListEmptyComponent={
        status === "pending" ? (
          <Loading text="Loading episodes..." />
        ) : status === "error" ? (
          <ErrorFeedback onRetry={onRetry} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  episodesTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
});
