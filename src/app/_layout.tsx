import { HeaderBackButton } from "@react-navigation/elements";
import { QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@/api/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="shows/[id]"
          options={{
            title: "",
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerLeft: () => (
              <HeaderBackButton
                label="Back"
                onPress={() => router.back()}
                displayMode="default"
              />
            ),
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
