import { useMemo } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import type { Episode, Show } from "@/api/types";
import EpisodeListItem from "@/components/EpisodeListItem";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import ShowHeader from "@/features/ShowHeader";
import {
  type EpisodeSection,
  groupEpisodesBySeason,
} from "@/lib/groupEpisodesBySeason";
import { colors } from "@/styles/theme";

function keyExtractor(episode: Episode) {
  return episode.id.toString();
}

function renderItem({ item }: { item: Episode }) {
  return <EpisodeListItem episode={item} />;
}

function renderSectionHeader({ section }: { section: EpisodeSection }) {
  return (
    <View style={styles.seasonHeader}>
      <Text style={styles.seasonHeaderText}>Season {section.season}</Text>
    </View>
  );
}

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
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  seasonHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.placeholderBackground,
  },
  seasonHeaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
