import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { friendsZoneTheme } from "../theme";

export default function FloatingCreateButton() {
  return (
    <Pressable style={styles.button} onPress={() => router.push("/criar-encontro")}>
      <Ionicons name="add" size={18} color="#fff" />
      <Text style={styles.text}>Criar encontro</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    bottom: 98,
    backgroundColor: friendsZoneTheme.colors.secondary,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...friendsZoneTheme.shadows.card,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
