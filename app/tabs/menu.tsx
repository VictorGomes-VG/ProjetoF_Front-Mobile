import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { availableThemes, friendsZoneTheme, setThemePreference, useThemeSettings } from "../theme";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function SectionRow({ item }: { item: MenuItem }) {
  return (
    <Pressable style={styles.rowButton} onPress={item.onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={item.icon} size={24} color={friendsZoneTheme.colors.text} />
        <Text style={styles.rowLabel}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={friendsZoneTheme.colors.text} />
    </Pressable>
  );
}

export default function Menu() {
  const themeState = useThemeSettings();
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  async function handleThemeChange(themeId: (typeof availableThemes)[number]["id"]) {
    if (themeId === themeState.currentThemeName) {
      setThemeModalOpen(false);
      return;
    }

    Alert.alert("Aplicar estilo", "Vamos recarregar a interface para aplicar o novo visual.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aplicar",
        onPress: () => {
          setThemeModalOpen(false);
          void setThemePreference(themeId);
        },
      },
    ]);
  }

  const discoverItems: MenuItem[] = [
    {
      label: "Recomendacoes",
      icon: "thumbs-up-outline",
      onPress: () => router.push("/tabs"),
    },
    {
      label: "Favoritos",
      icon: "heart-outline",
      onPress: () => Alert.alert("Em breve", "Favoritos entra no proximo incremento."),
    },
    {
      label: "Visitas",
      icon: "calendar-clear-outline",
      onPress: () => router.push("/tabs/locais"),
    },
    {
      label: "Propostas",
      icon: "receipt-outline",
      onPress: () => Alert.alert("Em breve", "Propostas ainda nao foram implementadas."),
    },
    {
      label: "Alertas",
      icon: "notifications-outline",
      onPress: () => Alert.alert("Em breve", "Alertas entram junto com notificacoes reais."),
    },
    {
      label: "Historico de encontros",
      icon: "time-outline",
      onPress: () => Alert.alert("Em breve", "Historico completo entra em uma proxima etapa."),
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      label: "Informacoes pessoais",
      icon: "person-outline",
      onPress: () => router.push("/tabs/perfil"),
    },
    {
      label: "Gerenciar notificacoes",
      icon: "notifications-outline",
      onPress: () => Alert.alert("Em breve", "A central de notificacoes entra depois do MVP."),
    },
    {
      label: "Escolher estilo do app",
      icon: "color-palette-outline",
      onPress: () => setThemeModalOpen(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Busca e encontros</Text>
          {discoverItems.map((item) => (
            <SectionRow key={item.label} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil e configuracoes</Text>
          {settingsItems.map((item) => (
            <SectionRow key={item.label} item={item} />
          ))}
        </View>
      </ScrollView>

      <Modal visible={themeModalOpen} transparent animationType="fade" onRequestClose={() => setThemeModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolher estilo do FriendsZone</Text>
              <Pressable onPress={() => setThemeModalOpen(false)}>
                <Ionicons name="close" size={22} color={friendsZoneTheme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.themeList}>
              {availableThemes.map((theme) => {
                const active = theme.id === themeState.currentThemeName;
                return (
                  <Pressable
                    key={theme.id}
                    style={[styles.themeCard, active && styles.themeCardActive]}
                    onPress={() => void handleThemeChange(theme.id)}
                  >
                    <View style={styles.themeHeader}>
                      <Text style={[styles.themeName, active && styles.themeNameActive]}>{theme.name}</Text>
                      {active ? <Text style={styles.themeActiveLabel}>Ativo</Text> : null}
                    </View>
                    <Text style={styles.themeDescription}>{theme.description}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 28,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    color: friendsZoneTheme.colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  rowButton: {
    minHeight: 88,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: friendsZoneTheme.colors.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flex: 1,
  },
  rowLabel: {
    color: friendsZoneTheme.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.overlay,
    justifyContent: "flex-end",
    padding: 16,
  },
  modalCard: {
    borderRadius: 24,
    backgroundColor: friendsZoneTheme.colors.surface,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    color: friendsZoneTheme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  themeList: {
    gap: 10,
  },
  themeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    backgroundColor: friendsZoneTheme.colors.surfaceAlt,
    padding: 14,
    gap: 6,
  },
  themeCardActive: {
    borderColor: friendsZoneTheme.colors.secondary,
    backgroundColor: friendsZoneTheme.colors.secondarySoft,
  },
  themeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  themeName: {
    color: friendsZoneTheme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  themeNameActive: {
    color: friendsZoneTheme.colors.secondary,
  },
  themeActiveLabel: {
    color: friendsZoneTheme.colors.secondary,
    fontSize: 12,
    fontWeight: "800",
  },
  themeDescription: {
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
