import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import ScreenTitle from "@/components/ScreenTitle";
import { colors } from "@/styles/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "List",
          headerTitle: () => <ScreenTitle title="Jolly TV" />,
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: "transparent",
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
