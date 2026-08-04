import { StyleSheet, View } from "react-native";
import Empty from "@/components/Empty";
import ErrorFeedback from "@/components/Error";
import Loading from "@/components/Loading";
import ShowList from "@/features/ShowList";
import { useFavoriteShows } from "@/hooks/useFavoriteShows";

export default function Favorites() {
  const { shows, isPending, isError, refetch } = useFavoriteShows();
  const hasData = !!shows.length;

  return (
    <View style={styles.container}>
      {isPending && <Loading />}

      {isError && !isPending && !hasData && <ErrorFeedback onRetry={refetch} />}

      {!isPending && !isError && !hasData && (
        <Empty
          title="No favorites yet"
          description="Tap the heart on a show to add it here."
        />
      )}

      {!isPending && hasData && <ShowList shows={shows} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
