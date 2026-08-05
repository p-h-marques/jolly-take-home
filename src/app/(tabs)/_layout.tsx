import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import ScreenTitle from "@/components/ScreenTitle";
import { useFavorites } from "@/hooks/useFavorites";
import { colors } from "@/styles/theme";

export default function TabsLayout() {
  const { favoriteIds } = useFavorites();

  const favoritesBadge =
    favoriteIds.length > 0 ? favoriteIds.length : undefined;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
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
          headerTitle: () => (
            <ScreenTitle title="Favorites" count={favoritesBadge} />
          ),
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
          tabBarBadge: favoritesBadge,
        }}
      />
    </Tabs>
  );
}
