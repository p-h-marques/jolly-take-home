import { StyleSheet, Text, View } from "react-native";
import type { EpisodeSection } from "@/lib/groupEpisodesBySeason";
import { colors } from "@/styles/theme";

interface IProps {
  section: EpisodeSection;
}

export default function SeasonHeader(props: IProps) {
  const { section } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Season {section.season}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.placeholderBackground,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
