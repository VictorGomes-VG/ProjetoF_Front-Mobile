import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { initializeAuthSession, useAuthSession } from "./data/authStore";

export default function RootLayout() {
  const session = useAuthSession();

  useEffect(() => {
    void initializeAuthSession();
  }, []);

  if (!session.isInitialized) {
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
    backgroundColor: "#EFF6FF",
  },
});
