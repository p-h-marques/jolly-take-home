import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { queryClient } from "@/api/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shows/[id]" options={{ title: "Show" }} />
      </Stack>
    </QueryClientProvider>
  );
}
