import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Animated, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSession } from "./data/authStore";
import ScalePressable from "./components/ScalePressable";
import SkeletonBlock from "./components/SkeletonBlock";
import { joinEncontro, leaveEncontro, loadEncontroById, useEncontros, useEncontrosStatus } from "./data/encontrosStore";
import { type EncontroTipo } from "./data/mockEncontros";
import AvaliacaoInfo, { getMedalhaAvaliacao } from "./components/AvaliacaoInfo";
import { useEntranceAnimation } from "./hooks/useEntranceAnimation";
import { friendsZoneTheme } from "./theme";

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
  const heroAnimation = useEntranceAnimation({ delay: 40, distance: 18, scaleFrom: 0.995 });
  const infoAnimation = useEntranceAnimation({ delay: 120, distance: 24, scaleFrom: 0.99 });
  const contentAnimation = useEntranceAnimation({ delay: 200, distance: 28, scaleFrom: 0.99 });
  const ctaAnimation = useEntranceAnimation({ delay: 290, distance: 28, scaleFrom: 0.99 });
  const session = useAuthSession();
  const encontros = useEncontros();
  const { isLoading, isInitialized } = useEncontrosStatus();
  const params = useLocalSearchParams<{ id?: string; nome?: string; tipo?: string; descricao?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const encontro = encontros.find((item) => item.id === params.id);

  useEffect(() => {
    if (params.id && !encontro) {
      void loadEncontroById(params.id);
    }
  }, [encontro, params.id]);

  if ((!isInitialized || isLoading) && !encontro) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingSkeletonWrap, heroAnimation]}>
          <SkeletonBlock style={styles.loadingHero} />
          <View style={styles.loadingContent}>
            <View style={styles.loadingBadges}>
              <SkeletonBlock style={styles.loadingBadge} />
              <SkeletonBlock style={[styles.loadingBadge, styles.loadingBadgeShort]} />
            </View>
            <SkeletonBlock style={styles.loadingTitle} />
            <SkeletonBlock style={styles.loadingSubtitle} />
            <SkeletonBlock style={styles.loadingCard} />
            <SkeletonBlock style={styles.loadingTextLine} />
            <SkeletonBlock style={[styles.loadingTextLine, styles.loadingTextLineShort]} />
          </View>
        </Animated.View>
        <ActivityIndicator size="small" color="#0066FF" />
        <Text style={styles.loadingText}>Carregando encontro...</Text>
      </View>
    );
  }

  if (!encontro) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Encontro nao encontrado</Text>
        <Text style={styles.emptyText}>Esse encontro pode ter sido removido da lista local.</Text>
        <ScalePressable style={styles.backButton} onPress={() => router.back()} pressedScale={0.97}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </ScalePressable>
      </View>
    );
  }

  const vagasRestantes = encontro.capacidade - encontro.participantes;
  const imageSource = encontro.imagemUrl || fallbackImageByTipo[encontro.tipo];
  const medalha = getMedalhaAvaliacao(encontro.nota, encontro.totalAvaliacoes);

  async function handleJoinToggle() {
    if (!params.id) {
      return;
    }

    if (!session.user) {
      Alert.alert("Sessao expirada", "Entre novamente para participar do encontro.");
      router.replace("/login");
      return;
    }

    try {
      setIsSubmitting(true);
      if (encontro.isJoined) {
        await leaveEncontro(params.id);
      } else {
        await joinEncontro(params.id);
      }
    } catch (error) {
      Alert.alert(
        "Nao foi possivel atualizar sua participacao",
        error instanceof Error ? error.message : "Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.heroContainer, heroAnimation]}>
          <Image source={{ uri: imageSource }} style={styles.heroImage} />
          <ScalePressable style={styles.heroBack} onPress={() => router.back()} pressedScale={0.94}>
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
          </ScalePressable>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View style={infoAnimation}>
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
            {encontro.codigo ? (
              <View style={styles.codeChip}>
                <Ionicons name="qr-code-outline" size={14} color={friendsZoneTheme.colors.primary} />
                <Text style={styles.codeChipText}>{`Codigo do encontro: ${encontro.codigo}`}</Text>
              </View>
            ) : null}
            <View style={styles.ratingRow}>
              <AvaliacaoInfo nota={encontro.nota} totalAvaliacoes={encontro.totalAvaliacoes} />
              {medalha && (
                <View style={styles.medalhaChip}>
                  <Text style={styles.medalhaText}>{medalha}</Text>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View style={[styles.infoCard, contentAnimation]}>
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
          </Animated.View>

          <Animated.View style={contentAnimation}>
            <Text style={styles.sectionTitle}>Sobre o encontro</Text>
            <Text style={styles.description}>{encontro.descricao}</Text>
            <View style={styles.tagsRow}>
              {encontro.comunidadeTags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.ctaCard, ctaAnimation]}>
            {encontro.isOwner ? (
              <View style={[styles.ctaButton, styles.ownerButton]}>
                <Text style={styles.ownerButtonText}>Voce esta organizando este encontro</Text>
              </View>
            ) : (
              <ScalePressable
                style={[
                  styles.ctaButton,
                  encontro.isJoined ? styles.leaveButton : styles.joinButton,
                  (vagasRestantes <= 0 || isSubmitting) && !encontro.isJoined && styles.ctaDisabled,
                ]}
                disabled={(vagasRestantes <= 0 && !encontro.isJoined) || isSubmitting}
                onPress={() => void handleJoinToggle()}
                pressedScale={0.975}
              >
                <Text style={[styles.ctaButtonText, encontro.isJoined && styles.leaveButtonText]}>
                  {isSubmitting
                    ? "Atualizando..."
                    : encontro.isJoined
                      ? "Cancelar participacao"
                      : vagasRestantes <= 0
                        ? "Encontro lotado"
                        : "Participar do encontro"}
                </Text>
              </ScalePressable>
            )}
            <Text style={styles.ctaHint}>
              {encontro.isJoined
                ? "Sua vaga esta confirmada. Se sair agora, outra pessoa podera ocupar esse lugar."
                : "Entre para aparecer em Meus encontros e acompanhar a organizacao com o host."}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
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
    backgroundColor: "rgba(255,248,242,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginTop: -14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: friendsZoneTheme.colors.background,
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
    backgroundColor: friendsZoneTheme.colors.primarySoft,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: friendsZoneTheme.colors.primary,
  },
  freeBadge: {
    backgroundColor: friendsZoneTheme.colors.accentSoft,
  },
  paidBadge: {
    backgroundColor: friendsZoneTheme.colors.secondarySoft,
  },
  freeText: {
    color: friendsZoneTheme.colors.accent,
  },
  paidText: {
    color: friendsZoneTheme.colors.secondary,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: friendsZoneTheme.colors.textMuted,
  },
  codeChip: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: friendsZoneTheme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  codeChipText: {
    color: friendsZoneTheme.colors.primary,
    fontWeight: "700",
    fontSize: 12,
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
    backgroundColor: friendsZoneTheme.colors.warningSoft,
    borderWidth: 1,
    borderColor: "#F2C078",
  },
  medalhaText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "700",
  },
  infoCard: {
    marginTop: 14,
    backgroundColor: friendsZoneTheme.colors.surface,
    borderRadius: 18,
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
    color: friendsZoneTheme.colors.text,
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
    color: friendsZoneTheme.colors.text,
  },
  description: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: friendsZoneTheme.colors.text,
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
    backgroundColor: friendsZoneTheme.colors.secondarySoft,
    borderWidth: 1,
    borderColor: "#F7B3A9",
  },
  tagText: {
    fontSize: 12,
    color: friendsZoneTheme.colors.secondary,
    fontWeight: "600",
  },
  ctaCard: {
    marginTop: 18,
    backgroundColor: friendsZoneTheme.colors.surface,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  ctaButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  joinButton: {
    backgroundColor: friendsZoneTheme.colors.secondary,
  },
  leaveButton: {
    backgroundColor: friendsZoneTheme.colors.secondarySoft,
    borderWidth: 1,
    borderColor: "#F7B3A9",
  },
  ownerButton: {
    backgroundColor: friendsZoneTheme.colors.primarySoft,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  leaveButtonText: {
    color: "#B42318",
  },
  ownerButtonText: {
    color: friendsZoneTheme.colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  ctaHint: {
    color: friendsZoneTheme.colors.textMuted,
    lineHeight: 19,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  loadingSkeletonWrap: {
    width: "100%",
    gap: 0,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: friendsZoneTheme.colors.surface,
  },
  loadingHero: {
    width: "100%",
    height: 260,
    borderRadius: 0,
  },
  loadingContent: {
    padding: 16,
    gap: 12,
  },
  loadingBadges: {
    flexDirection: "row",
    gap: 8,
  },
  loadingBadge: {
    width: 96,
    height: 28,
    borderRadius: 999,
  },
  loadingBadgeShort: {
    width: 74,
  },
  loadingTitle: {
    width: "72%",
    height: 26,
  },
  loadingSubtitle: {
    width: "38%",
    height: 16,
  },
  loadingCard: {
    width: "100%",
    height: 118,
    borderRadius: 18,
  },
  loadingTextLine: {
    width: "100%",
    height: 14,
  },
  loadingTextLineShort: {
    width: "58%",
  },
  loadingText: {
    color: friendsZoneTheme.colors.textMuted,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  emptyText: {
    color: friendsZoneTheme.colors.textMuted,
    textAlign: "center",
  },
  backButton: {
    marginTop: 6,
    backgroundColor: friendsZoneTheme.colors.secondary,
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
