import { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchMyEvents } from "../services/friendZoneApi";
import { type Encontro, type EncontroTipo } from "../data/mockEncontros";
import FloatingCreateButton from "../components/FloatingCreateButton";
import ScalePressable from "../components/ScalePressable";
import { friendsZoneTheme } from "../theme";
import { getEventDateTime, getEventTimelineBucket } from "../utils/eventTimeline";

const imageByTipo: Record<EncontroTipo, string> = {
  esporte: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
  networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
  musica: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
};

type MeuEncontro = Encontro & {
  status: "Criado por voce" | "Confirmado";
};

function CardMeuEncontro({ item }: { item: MeuEncontro }) {
  const vagasRestantes = item.capacidade - item.participantes;
  return (
    <ScalePressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/detalhes",
          params: {
            id: item.id,
            nome: item.titulo,
            tipo: item.tipo,
            descricao: item.descricao,
          },
        })
      }
      pressedScale={0.985}
    >
      <Image source={{ uri: imageByTipo[item.tipo] }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "Criado por voce" && styles.statusCreated,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "Criado por voce" && styles.statusCreatedText,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>{`${item.bairro} | ${item.data} | ${item.hora}`}</Text>
        <Text numberOfLines={2} style={styles.cardDescription}>
          {item.descricao}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.infoInline}>
            <Ionicons name="people-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{`${item.participantes}/${item.capacidade} pessoas`}</Text>
          </View>
          <Text style={[styles.vagaText, vagasRestantes <= 2 && styles.vagaWarn]}>
            {vagasRestantes > 0 ? `${vagasRestantes} vagas` : "Lotado"}
          </Text>
        </View>
      </View>
    </ScalePressable>
  );
}

export default function MeusEncontros() {
  const [meusEncontros, setMeusEncontros] = useState<MeuEncontro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadMyEvents() {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetchMyEvents();
          if (!isActive) {
            return;
          }

          const created = response.created.map((item) => ({ ...item, status: "Criado por voce" as const }));
          const joined = response.joined
            .filter((item) => !created.some((createdItem) => createdItem.id === item.id))
            .map((item) => ({ ...item, status: "Confirmado" as const }));

          setMeusEncontros([...created, ...joined]);
        } catch (loadError) {
          if (isActive) {
            setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar seus encontros.");
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadMyEvents();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const agenda = meusEncontros
    .filter((item) => getEventTimelineBucket(item) === "upcoming")
    .sort((left, right) => getEventDateTime(left).getTime() - getEventDateTime(right).getTime());
  const historico = meusEncontros
    .filter((item) => getEventTimelineBucket(item) === "past")
    .sort((left, right) => getEventDateTime(right).getTime() - getEventDateTime(left).getTime());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Agenda e historico</Text>
        <Text style={styles.subheading}>Sua area de acompanhamento: o que esta confirmado, criado e o que ja rolou.</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{meusEncontros.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{agenda.length}</Text>
          <Text style={styles.summaryLabel}>Agenda</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{historico.length}</Text>
          <Text style={styles.summaryLabel}>Historico</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.feedbackContainer}>
          <ActivityIndicator color="#0066FF" />
          <Text style={styles.feedbackText}>Carregando seus encontros...</Text>
        </View>
      ) : error ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Nao foi possivel carregar</Text>
          <Text style={styles.feedbackText}>{error}</Text>
        </View>
      ) : meusEncontros.length === 0 ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Voce ainda nao entrou em nenhum encontro</Text>
          <Text style={styles.feedbackText}>Crie seu primeiro encontro ou participe de algum que combine com voce.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Na sua agenda</Text>
            <Text style={styles.sectionSubtitle}>Encontros confirmados ou criados que ainda vao acontecer.</Text>
            {agenda.length > 0 ? (
              agenda.map((item) => <CardMeuEncontro key={item.id} item={item} />)
            ) : (
              <View style={styles.emptySectionCard}>
                <Text style={styles.emptySectionTitle}>Agenda vazia</Text>
                <Text style={styles.emptySectionText}>Quando voce entrar em um encontro futuro, ele aparece aqui.</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Historico</Text>
            <Text style={styles.sectionSubtitle}>Encontros passados para voce acompanhar sua jornada social.</Text>
            {historico.length > 0 ? (
              historico.map((item) => <CardMeuEncontro key={item.id} item={item} />)
            ) : (
              <View style={styles.emptySectionCard}>
                <Text style={styles.emptySectionTitle}>Sem historico ainda</Text>
                <Text style={styles.emptySectionText}>Depois dos seus primeiros encontros concluidos, eles aparecem aqui.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      <FloatingCreateButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: friendsZoneTheme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  subheading: {
    marginTop: 3,
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 13,
  },
  summary: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: friendsZoneTheme.colors.secondary,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: friendsZoneTheme.colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 98,
    gap: 12,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: friendsZoneTheme.colors.text,
  },
  sectionSubtitle: {
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  card: {
    backgroundColor: friendsZoneTheme.colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
  },
  cardImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#E2E8F0",
  },
  cardBody: {
    padding: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#E9FBEF",
  },
  statusCreated: {
    backgroundColor: friendsZoneTheme.colors.secondarySoft,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0E8A44",
  },
  statusCreatedText: {
    color: friendsZoneTheme.colors.secondary,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  cardDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#64748B",
  },
  vagaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0E8A44",
  },
  vagaWarn: {
    color: "#B42318",
  },
  emptySectionCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: friendsZoneTheme.colors.surface,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    gap: 4,
  },
  emptySectionTitle: {
    color: friendsZoneTheme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  emptySectionText: {
    color: friendsZoneTheme.colors.textMuted,
    lineHeight: 19,
  },
  feedbackContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  feedbackTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  feedbackText: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
