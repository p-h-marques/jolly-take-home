import { StyleSheet, View } from "react-native";
import type { Show, ShowAllStatus } from "@/api/types";
import Badge from "@/components/Badge";

interface IProps {
  status: ShowAllStatus[];
  setStatus: React.Dispatch<React.SetStateAction<ShowAllStatus[]>>;
}

export function filterShowsByStatus(shows: Show[], status: ShowAllStatus[]) {
  return shows.filter((show) => {
    if (status.length === 0) {
      return true;
    }

    return status.includes(show.status);
  });
}

export default function StatusFilters(props: IProps) {
  const { status, setStatus } = props;

  const handlePress = (type: ShowAllStatus) => {
    if (status.includes(type)) {
      setStatus((prev) => prev.filter((s) => s !== type));
    } else {
      const statusToSave = [...status, type];
      setStatus(statusToSave.length > 2 ? [] : statusToSave);
    }
  };

  return (
    <View style={styles.container}>
      <Badge
        type="All"
        inactive={status.length > 0}
        onPress={() => setStatus([])}
      />
      <Badge
        type="Running"
        inactive={!status.includes("Running")}
        onPress={() => handlePress("Running")}
      />
      <Badge
        type="Ended"
        inactive={!status.includes("Ended")}
        onPress={() => handlePress("Ended")}
      />
      <Badge
        type="To Be Determined"
        inactive={!status.includes("To Be Determined")}
        onPress={() => handlePress("To Be Determined")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
