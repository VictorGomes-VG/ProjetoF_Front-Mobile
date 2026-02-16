import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { encontrosMock, type Encontro, type EncontroTipo } from "../data/mockEncontros";

const imageByTipo: Record<EncontroTipo, string> = {
  esporte: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
  networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
  musica: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
};

type MeuEncontro = Encontro & {
  status: "Confirmado" | "Lista de espera";
};

const meusEncontros: MeuEncontro[] = encontrosMock.slice(0, 4).map((item, index) => ({
  ...item,
  status: index === 3 ? "Lista de espera" : "Confirmado",
}));

function CardMeuEncontro({ item }: { item: MeuEncontro }) {
  const vagasRestantes = item.capacidade - item.participantes;
  return (
    <Pressable
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
    >
      <Image source={{ uri: imageByTipo[item.tipo] }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <View style={[styles.statusBadge, item.status === "Lista de espera" && styles.statusWait]}>
            <Text style={[styles.statusText, item.status === "Lista de espera" && styles.statusWaitText]}>
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
    </Pressable>
  );
}

export default function MeusEncontros() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Meus encontros</Text>
        <Text style={styles.subheading}>Acompanhe os encontros em que voce esta participando</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{meusEncontros.length}</Text>
          <Text style={styles.summaryLabel}>Inscricoes</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{meusEncontros.filter((e) => e.status === "Confirmado").length}</Text>
          <Text style={styles.summaryLabel}>Confirmados</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{meusEncontros.filter((e) => e.status === "Lista de espera").length}</Text>
          <Text style={styles.summaryLabel}>Espera</Text>
        </View>
      </View>

      <FlatList
        data={meusEncontros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <CardMeuEncontro item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subheading: {
    marginTop: 3,
    color: "#64748B",
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
    color: "#0066FF",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 98,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
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
    color: "#0F172A",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#E9FBEF",
  },
  statusWait: {
    backgroundColor: "#FFF4E5",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0E8A44",
  },
  statusWaitText: {
    color: "#B45309",
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
});
