import { Tabs } from "expo-router";
import ScreenTitle from "@/components/ScreenTitle";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "List",
          headerTitle: () => <ScreenTitle title="Jolly TV" />,
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitle: () => <ScreenTitle title="Favorites" />,
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </Tabs>
  );
}
