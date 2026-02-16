import { useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { encontrosMock, type Encontro, type EncontroPreco, type EncontroTipo } from "../data/mockEncontros";

type TipoFiltro = "todos" | EncontroTipo;
type PrecoFiltro = "todos" | EncontroPreco;

const labelTipo: Record<EncontroTipo, string> = {
  esporte: "Esporte",
  networking: "Networking",
  games: "Games",
  musica: "Musica",
  cafe: "Cafe",
};

const tipos: TipoFiltro[] = ["todos", "esporte", "networking", "games", "musica", "cafe"];
const precos: PrecoFiltro[] = ["todos", "gratis", "pago"];

const labelTipoFiltro: Record<TipoFiltro, string> = {
  todos: "Todos",
  esporte: "Esporte",
  networking: "Networking",
  games: "Games",
  musica: "Musica",
  cafe: "Cafe",
};

const labelPrecoFiltro: Record<PrecoFiltro, string> = {
  todos: "Qualquer preco",
  gratis: "Gratis",
  pago: "Pago",
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
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todos");
  const [precoFiltro, setPrecoFiltro] = useState<PrecoFiltro>("todos");
  const [apenasComVaga, setApenasComVaga] = useState(false);

  const encontrosFiltrados = useMemo(() => {
    return encontrosMock.filter((encontro) => {
      const okTipo = tipoFiltro === "todos" || encontro.tipo === tipoFiltro;
      const okPreco = precoFiltro === "todos" || encontro.preco === precoFiltro;
      const okVaga = !apenasComVaga || encontro.participantes < encontro.capacidade;
      return okTipo && okPreco && okVaga;
    });
  }, [apenasComVaga, precoFiltro, tipoFiltro]);

  const totalFiltrosAtivos =
    (tipoFiltro !== "todos" ? 1 : 0) + (precoFiltro !== "todos" ? 1 : 0) + (apenasComVaga ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Encontros em destaque</Text>
          <Text style={styles.subheading}>Descubra grupos e atividades perto de voce</Text>
        </View>
        <Pressable style={styles.filterButton} onPress={() => setModalFiltroAberto(true)}>
          <Ionicons name="options-outline" size={16} color="#0F172A" />
          <Text style={styles.filterButtonText}>Filtro</Text>
          {totalFiltrosAtivos > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{totalFiltrosAtivos}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={encontrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardEncontro item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalFiltroAberto} transparent animationType="fade" onRequestClose={() => setModalFiltroAberto(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <Pressable onPress={() => setModalFiltroAberto(false)}>
                <Ionicons name="close" size={22} color="#334155" />
              </Pressable>
            </View>

            <Text style={styles.modalSectionTitle}>Tipo de encontro</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {tipos.map((tipo) => (
                <Pressable
                  key={tipo}
                  onPress={() => setTipoFiltro(tipo)}
                  style={[styles.chip, tipoFiltro === tipo && styles.chipActive]}
                >
                  <Text style={[styles.chipText, tipoFiltro === tipo && styles.chipTextActive]}>
                    {labelTipoFiltro[tipo]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.modalSectionTitle}>Preco</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {precos.map((preco) => (
                <Pressable
                  key={preco}
                  onPress={() => setPrecoFiltro(preco)}
                  style={[styles.chip, precoFiltro === preco && styles.chipActive]}
                >
                  <Text style={[styles.chipText, precoFiltro === preco && styles.chipTextActive]}>
                    {labelPrecoFiltro[preco]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.modalSectionTitle}>Vagas</Text>
            <Pressable
              onPress={() => setApenasComVaga((prev) => !prev)}
              style={[styles.chip, apenasComVaga && styles.chipActive, styles.singleChip]}
            >
              <Text style={[styles.chipText, apenasComVaga && styles.chipTextActive]}>Somente encontros com vaga</Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.clearButton}
                onPress={() => {
                  setTipoFiltro("todos");
                  setPrecoFiltro("todos");
                  setApenasComVaga(false);
                }}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={() => setModalFiltroAberto(false)}>
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </Pressable>
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
    backgroundColor: "#F4F7FB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
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
  filterButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D6DFEA",
    backgroundColor: "#fff",
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSectionTitle: {
    marginTop: 8,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  chipsRow: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#D6DFEA",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#0066FF",
    borderColor: "#0066FF",
  },
  chipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  singleChip: {
    alignSelf: "flex-start",
  },
  modalActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D6DFEA",
    borderRadius: 10,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1.2,
    backgroundColor: "#0066FF",
    borderRadius: 10,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
