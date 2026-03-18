import { useEffect } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { loadEncontroById, useEncontros, useEncontrosStatus } from "./data/encontrosStore";
import { type EncontroTipo } from "./data/mockEncontros";
import AvaliacaoInfo, { getMedalhaAvaliacao } from "./components/AvaliacaoInfo";

const tipoLabel: Record<EncontroTipo, string> = {
  esporte: "Esporte",
  networking: "Networking",
  games: "Games",
  musica: "Musica",
  cafe: "Cafe",
};

const fallbackImageByTipo: Record<EncontroTipo, string> = {
  esporte: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  musica: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
};

export default function Detalhes() {
  const encontros = useEncontros();
  const { isLoading, isInitialized } = useEncontrosStatus();
  const params = useLocalSearchParams<{ id?: string; nome?: string; tipo?: string; descricao?: string }>();

  const encontro = encontros.find((item) => item.id === params.id);

  useEffect(() => {
    if (params.id && !encontro) {
      void loadEncontroById(params.id);
    }
  }, [encontro, params.id]);

  if ((!isInitialized || isLoading) && !encontro) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Carregando encontro...</Text>
      </View>
    );
  }

  if (!encontro) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Encontro nao encontrado</Text>
        <Text style={styles.emptyText}>Esse encontro pode ter sido removido da lista local.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const vagasRestantes = encontro.capacidade - encontro.participantes;
  const imageSource = encontro.imagemUrl || fallbackImageByTipo[encontro.tipo];
  const medalha = getMedalhaAvaliacao(encontro.nota, encontro.totalAvaliacoes);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageSource }} style={styles.heroImage} />
          <Pressable style={styles.heroBack} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tipoLabel[encontro.tipo]}</Text>
            </View>
            <View style={[styles.badge, encontro.preco === "gratis" ? styles.freeBadge : styles.paidBadge]}>
              <Text style={[styles.badgeText, encontro.preco === "gratis" ? styles.freeText : styles.paidText]}>
                {encontro.preco === "gratis" ? "Gratis" : "Pago"}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{encontro.titulo}</Text>
          <Text style={styles.subtitle}>{`Friend: ${encontro.anfitriao}`}</Text>
          <View style={styles.ratingRow}>
            <AvaliacaoInfo nota={encontro.nota} totalAvaliacoes={encontro.totalAvaliacoes} />
            {medalha && (
              <View style={styles.medalhaChip}>
                <Text style={styles.medalhaText}>{medalha}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#475569" />
              <Text style={styles.infoText}>{`${encontro.data} as ${encontro.hora}`}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#475569" />
              <Text style={styles.infoText}>{`${encontro.bairro} - ${encontro.endereco}`}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color="#475569" />
              <Text style={styles.infoText}>{`${encontro.participantes}/${encontro.capacidade} participantes`}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={vagasRestantes > 0 ? "checkmark-circle-outline" : "close-circle-outline"}
                size={16}
                color={vagasRestantes > 0 ? "#0E8A44" : "#B42318"}
              />
              <Text style={[styles.infoText, vagasRestantes <= 0 && styles.warningText]}>
                {vagasRestantes > 0 ? `${vagasRestantes} vagas disponiveis` : "Encontro lotado"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sobre o encontro</Text>
          <Text style={styles.description}>{encontro.descricao}</Text>
          <View style={styles.tagsRow}>
            {encontro.comunidadeTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  heroContainer: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 260,
    backgroundColor: "#E2E8F0",
  },
  heroBack: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginTop: -14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#F4F7FB",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EAF2FF",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B5ED7",
  },
  freeBadge: {
    backgroundColor: "#E9FBEF",
  },
  paidBadge: {
    backgroundColor: "#ECF2FF",
  },
  freeText: {
    color: "#0E8A44",
  },
  paidText: {
    color: "#0B5ED7",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: "#64748B",
  },
  ratingRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  medalhaChip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  medalhaText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "700",
  },
  infoCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
  },
  warningText: {
    color: "#B42318",
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  description: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
  tagsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF1F3",
    borderWidth: 1,
    borderColor: "#FFC8D0",
  },
  tagText: {
    fontSize: 12,
    color: "#B42343",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#64748B",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
  backButton: {
    marginTop: 6,
    backgroundColor: "#0066FF",
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
