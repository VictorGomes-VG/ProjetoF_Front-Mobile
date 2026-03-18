import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { availableThemes, friendsZoneTheme, setThemePreference, useThemeSettings } from "../theme";

export default function Menu() {
  const themeState = useThemeSettings();

  async function handleThemeChange(themeId: (typeof availableThemes)[number]["id"]) {
    if (themeId === themeState.currentThemeName) {
      return;
    }

    Alert.alert("Aplicar estilo", "Vamos recarregar a interface para aplicar o novo visual.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aplicar",
        onPress: () => {
          void setThemePreference(themeId);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>FriendsZone</Text>
          <Text style={styles.title}>Personalize o clima do app</Text>
          <Text style={styles.subtitle}>Troque o estilo visual para testar direcoes diferentes de marca sem mudar o fluxo.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Estilo da interface</Text>
          <Text style={styles.sectionDescription}>A selecao recarrega o app para aplicar o tema inteiro com consistencia.</Text>

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
                    <View style={[styles.themeBadge, active && styles.themeBadgeActive]}>
                      <Text style={[styles.themeBadgeText, active && styles.themeBadgeTextActive]}>
                        {active ? "Ativo" : "Aplicar"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: friendsZoneTheme.colors.surface,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    padding: 18,
    gap: 6,
    ...friendsZoneTheme.shadows.card,
  },
  eyebrow: {
    color: friendsZoneTheme.colors.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: friendsZoneTheme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: friendsZoneTheme.colors.textMuted,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 18,
    backgroundColor: friendsZoneTheme.colors.surface,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: friendsZoneTheme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionDescription: {
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  themeList: {
    gap: 10,
    marginTop: 4,
  },
  themeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    backgroundColor: friendsZoneTheme.colors.surfaceAlt,
    padding: 12,
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
  themeBadge: {
    borderRadius: 999,
    backgroundColor: friendsZoneTheme.colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  themeBadgeActive: {
    backgroundColor: friendsZoneTheme.colors.secondary,
  },
  themeBadgeText: {
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  themeBadgeTextActive: {
    color: "#fff",
  },
  themeDescription: {
    color: friendsZoneTheme.colors.textMuted,
    lineHeight: 18,
    fontSize: 12,
  },
});
