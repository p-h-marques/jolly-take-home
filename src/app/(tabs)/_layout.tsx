import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "List" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
    </Tabs>
  );
}
