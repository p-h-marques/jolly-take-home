import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Loading from "@/components/Loading";
import { useShow } from "@/hooks/useShow";
import { useShowEpisodes } from "@/hooks/useShowEpisodes";

export default function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const headerHeight = useHeaderHeight();

  const { data: show, status: showStatus } = useShow(id);

  const { data: episodes, status: episodesStatus } = useShowEpisodes(id);

  const isLoading = showStatus === "pending" || episodesStatus === "pending";

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: headerHeight + 16,
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Show detail</Text>
          <Text>id: {id}</Text>
          <Text>Data: {show?.name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
