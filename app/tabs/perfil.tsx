import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { logout, useAuthSession } from "../data/authStore";
import { fetchMyEvents } from "../services/friendZoneApi";
import { friendsZoneTheme } from "../theme";

type ProfileStats = {
  createdCount: number;
  joinedCount: number;
  averageRating: number;
  totalRatings: number;
};

export default function Perfil() {
  const session = useAuthSession();
  const [stats, setStats] = useState<ProfileStats>({
    createdCount: 0,
    joinedCount: 0,
    averageRating: 0,
    totalRatings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadStats() {
        try {
          setIsLoading(true);
          const response = await fetchMyEvents();
          if (!isActive) {
            return;
          }

          const totalRatings = response.created.reduce((sum, item) => sum + item.totalAvaliacoes, 0);
          const weightedRating = response.created.reduce((sum, item) => sum + item.nota * item.totalAvaliacoes, 0);

          setStats({
            createdCount: response.created.length,
            joinedCount: response.joined.length,
            averageRating: totalRatings > 0 ? weightedRating / totalRatings : 0,
            totalRatings,
          });
        } catch {
          if (isActive) {
            setStats({
              createdCount: 0,
              joinedCount: 0,
              averageRating: 0,
              totalRatings: 0,
            });
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadStats();

      return () => {
        isActive = false;
      };
    }, [])
  );

  function handleLogout() {
    logout();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.cover} />
        <View style={styles.profileBlock}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=500&q=80" }}
            style={styles.avatarImage}
          />
          <View style={styles.identity}>
            <Text style={styles.name}>{session.user?.fullName ?? "Friend"}</Text>
            <Text style={styles.headline}>{session.user?.email ?? "Sem email carregado"}</Text>
            <Text style={styles.locationText}>{session.user?.city ?? "Cidade nao informada"}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.createdCount}</Text>
            <Text style={styles.statLabel}>Criados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.joinedCount}</Text>
            <Text style={styles.statLabel}>Participando</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}</Text>
            <Text style={styles.statLabel}>Reputacao</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre voce</Text>
        <Text style={styles.bioText}>{session.user?.bio || "Complete sua bio no cadastro para aparecer melhor no app."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo da conta</Text>
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#0B5ED7" />
            <Text style={styles.loadingText}>Atualizando seus numeros...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Eventos organizados</Text>
              <Text style={styles.summaryValue}>{stats.createdCount}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Eventos participando</Text>
              <Text style={styles.summaryValue}>{stats.joinedCount}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de avaliacoes recebidas</Text>
              <Text style={styles.summaryValue}>{stats.totalRatings}</Text>
            </View>
          </>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da conta</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          Alert.alert("Proximo passo", "No proximo incremento podemos salvar foto, bio e preferencias direto no back.")
        }
      >
        <Text style={styles.secondaryButtonText}>Ver proximo incremento</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
  },
  content: {
    padding: 14,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 12,
  },
  heroCard: {
    backgroundColor: friendsZoneTheme.colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
  },
  cover: {
    height: 110,
    backgroundColor: friendsZoneTheme.colors.secondary,
  },
  profileBlock: {
    paddingHorizontal: 14,
    marginTop: -28,
    flexDirection: "row",
    gap: 10,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#D6DFEA",
  },
  identity: {
    flex: 1,
    paddingTop: 28,
  },
  name: {
    fontSize: 21,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  headline: {
    marginTop: 2,
    fontSize: 13,
    color: friendsZoneTheme.colors.text,
    fontWeight: "500",
  },
  locationText: {
    marginTop: 6,
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 12,
  },
  statsRow: {
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: friendsZoneTheme.colors.secondary,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: friendsZoneTheme.colors.textMuted,
  },
  card: {
    backgroundColor: friendsZoneTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  bioText: {
    color: friendsZoneTheme.colors.text,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    minHeight: 30,
  },
  summaryLabel: {
    color: friendsZoneTheme.colors.text,
    flex: 1,
  },
  summaryValue: {
    color: friendsZoneTheme.colors.secondary,
    fontWeight: "700",
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: friendsZoneTheme.colors.border,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: friendsZoneTheme.colors.textMuted,
  },
  logoutButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: friendsZoneTheme.colors.secondary,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    backgroundColor: friendsZoneTheme.colors.surfaceAlt,
  },
  secondaryButtonText: {
    color: friendsZoneTheme.colors.text,
    fontWeight: "700",
  },
});
