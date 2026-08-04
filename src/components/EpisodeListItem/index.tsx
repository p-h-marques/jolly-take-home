import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Episode } from "@/api/types";
import { formatAirdate } from "@/lib/formatAirdate";
import { colors } from "@/styles/theme";

interface IProps {
  episode: Episode;
}

function EpisodeListItem(props: IProps) {
  const { episode } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.label} numberOfLines={1}>
        S{episode.season}E{episode.number} · {episode.name}
      </Text>
      <Text style={styles.date}>{formatAirdate(episode.airdate)}</Text>
    </View>
  );
}

export default memo(EpisodeListItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: 16,
  },
  label: {
    flex: 1,
    fontSize: 15,
  },
  date: {
    fontSize: 13,
    color: colors.placeholderIcon,
  },
});
