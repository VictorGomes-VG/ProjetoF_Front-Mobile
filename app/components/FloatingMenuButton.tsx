import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const links = [
  { label: "Inicio", icon: "home-outline", route: "/tabs" },
  { label: "Buscar", icon: "search-outline", route: "/tabs/buscar" },
  { label: "Meus encontros", icon: "calendar-outline", route: "/tabs/locais" },
  { label: "Mensagens", icon: "chatbubble-ellipses-outline", route: "/tabs/mensagens" },
  { label: "Perfil", icon: "person-circle-outline", route: "/tabs/perfil" },
  { label: "Criar encontro", icon: "add-circle-outline", route: "/criar-encontro" },
] as const;

export default function FloatingMenuButton() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable style={[styles.trigger, { top: insets.top + 10 }]} onPress={() => setOpen(true)}>
        <Ionicons name="menu" size={18} color="#0F172A" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.drawer, { paddingTop: insets.top + 12 }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color="#334155" />
              </Pressable>
            </View>

            {links.map((link) => (
              <Pressable
                key={link.route}
                style={styles.linkButton}
                onPress={() => {
                  setOpen(false);
                  router.push(link.route);
                }}
              >
                <Ionicons name={link.icon} size={18} color="#1E293B" />
                <Text style={styles.linkText}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: "absolute",
    left: 14,
    zIndex: 60,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6DFEA",
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
  },
  drawer: {
    width: 272,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    gap: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  drawerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  linkButton: {
    minHeight: 42,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFD",
  },
  linkText: {
    color: "#1E293B",
    fontWeight: "600",
  },
});
