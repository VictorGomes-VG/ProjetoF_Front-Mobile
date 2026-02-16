import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { encontrosMock, type Encontro, type EncontroTipo } from "../data/mockEncontros";

const labelTipo: Record<EncontroTipo, string> = {
  esporte: "Esporte",
  networking: "Networking",
  games: "Games",
  musica: "Musica",
  cafe: "Cafe",
};

const imageByTipo: Record<EncontroTipo, string> = {
  esporte: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  musica: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
};

function CardEncontro({ item }: { item: Encontro }) {
  const vagasRestantes = item.capacidade - item.participantes;
  const statusVaga = vagasRestantes > 0 ? `${vagasRestantes} vagas` : "Lotado";

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/detalhes",
          params: {
            id: item.id,
            nome: item.titulo,
            tipo: labelTipo[item.tipo],
            descricao: item.descricao,
          },
        })
      }
    >
      <Image source={{ uri: imageByTipo[item.tipo] }} style={styles.image} />
      <View style={styles.cardBody}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{labelTipo[item.tipo]}</Text>
          </View>
          <View style={[styles.badge, item.preco === "gratis" ? styles.badgeFree : styles.badgePaid]}>
            <Text style={[styles.badgeText, item.preco === "gratis" ? styles.badgeFreeText : styles.badgePaidText]}>
              {item.preco === "gratis" ? "Gratis" : "Pago"}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.descricao}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.infoText}>{item.bairro}</Text>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.infoText}>{`${item.data} | ${item.hora}`}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.hostText}>{`Anfitriao: ${item.anfitriao}`}</Text>
          <Text style={[styles.vagaText, vagasRestantes <= 2 && styles.vagaTextUrgente]}>{statusVaga}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Encontros em destaque</Text>
        <Text style={styles.subheading}>Descubra grupos e atividades perto de voce</Text>
      </View>

      <FlatList
        data={encontrosMock}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardEncontro item={item} />}
        contentContainerStyle={styles.listContent}
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
    paddingBottom: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subheading: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  image: {
    width: "100%",
    height: 182,
    backgroundColor: "#E2E8F0",
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  badgeFree: {
    backgroundColor: "#E9FBEF",
  },
  badgePaid: {
    backgroundColor: "#ECF2FF",
  },
  badgeFreeText: {
    color: "#0E8A44",
  },
  badgePaidText: {
    color: "#0B5ED7",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  description: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  infoRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 8,
  },
  footerRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hostText: {
    fontSize: 12,
    color: "#334155",
  },
  vagaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0E8A44",
  },
  vagaTextUrgente: {
    color: "#B42318",
  },
});
