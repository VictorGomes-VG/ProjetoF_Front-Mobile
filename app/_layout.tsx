import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { initializeAuthSession, useAuthSession } from "./data/authStore";
import { friendsZoneTheme, initializeTheme, useThemeSettings } from "./theme";

export default function RootLayout() {
  const session = useAuthSession();
  const theme = useThemeSettings();

  useEffect(() => {
    void initializeAuthSession();
    void initializeTheme();
  }, []);

  if (!session.isInitialized || !theme.isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: friendsZoneTheme.colors.background,
  },
});
