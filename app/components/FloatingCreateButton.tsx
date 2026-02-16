import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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
    backgroundColor: "#0066FF",
    minHeight: 46,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
