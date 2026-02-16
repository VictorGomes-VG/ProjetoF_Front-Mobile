import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Callout, Marker } from "react-native-maps";
import { router } from "expo-router";
import { useEncontros } from "../data/encontrosStore";
import { type Encontro, type EncontroPreco, type EncontroTipo } from "../data/mockEncontros";
import FloatingCreateButton from "../components/FloatingCreateButton";

type TipoFiltro = "todos" | EncontroTipo;
type PrecoFiltro = "todos" | EncontroPreco;

const tipos: TipoFiltro[] = ["todos", "esporte", "networking", "games", "musica", "cafe"];
const precos: PrecoFiltro[] = ["todos", "gratis", "pago"];

const labelsTipo: Record<TipoFiltro, string> = {
  todos: "Todos",
  esporte: "Esporte",
  networking: "Networking",
  games: "Games",
  musica: "Musica",
  cafe: "Cafe",
};

const labelsPreco: Record<PrecoFiltro, string> = {
  todos: "Qualquer preco",
  gratis: "Gratis",
  pago: "Pago",
};

const corPorTipo: Record<EncontroTipo, string> = {
  esporte: "#21A365",
  networking: "#0066FF",
  games: "#7E3AF2",
  musica: "#F97316",
  cafe: "#8B5E3C",
};

const iconePorTipo: Record<EncontroTipo, keyof typeof Ionicons.glyphMap> = {
  esporte: "walk",
  networking: "briefcase",
  games: "game-controller",
  musica: "musical-notes",
  cafe: "restaurant",
};

const imagemPorTipo: Record<EncontroTipo, string> = {
  esporte: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  musica: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
};

export default function Buscar() {
  const encontros = useEncontros();
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todos");
  const [precoFiltro, setPrecoFiltro] = useState<PrecoFiltro>("todos");
  const [apenasComVaga, setApenasComVaga] = useState(false);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Encontro | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const encontrosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    return encontros.filter((encontro) => {
      const matchTipo = tipoFiltro === "todos" || encontro.tipo === tipoFiltro;
      const matchPreco = precoFiltro === "todos" || encontro.preco === precoFiltro;
      const matchBusca =
        !texto ||
        encontro.titulo.toLowerCase().includes(texto) ||
        encontro.bairro.toLowerCase().includes(texto);
      const matchVaga = !apenasComVaga || encontro.participantes < encontro.capacidade;
      return matchTipo && matchPreco && matchBusca && matchVaga;
    });
  }, [apenasComVaga, busca, encontros, precoFiltro, tipoFiltro]);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: -23.5606,
          longitude: -46.6614,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
      >
        {encontrosFiltrados.map((encontro) => (
          <Marker
            key={encontro.id}
            coordinate={{ latitude: encontro.latitude, longitude: encontro.longitude }}
            onPress={() => setSelecionado(encontro)}
          >
            <View style={[styles.customPin, { backgroundColor: corPorTipo[encontro.tipo] }]}>
              <Ionicons name={iconePorTipo[encontro.tipo]} color="#fff" size={14} />
            </View>
            <Callout onPress={() => setSelecionado(encontro)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{encontro.titulo}</Text>
                <Text style={styles.calloutText}>{`${labelsTipo[encontro.tipo]} | ${encontro.bairro}`}</Text>
                <Text style={styles.calloutText}>{`${encontro.data} | ${encontro.hora}`}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topPanel}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Encontros perto de voce</Text>
              <Text style={styles.headerSubtitle}>{`${encontrosFiltrados.length} opcoes encontradas`}</Text>
            </View>
            <Pressable
              onPress={() => setFiltrosAbertos((prev) => !prev)}
              style={[styles.filterToggleButton, filtrosAbertos && styles.filterToggleButtonActive]}
            >
              <Ionicons name={filtrosAbertos ? "options" : "options-outline"} size={16} color="#0F172A" />
              <Text style={styles.filterToggleText}>{filtrosAbertos ? "Fechar" : "Filtros"}</Text>
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por titulo ou bairro"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          {filtrosAbertos && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {tipos.map((tipo) => (
                  <Pressable
                    key={tipo}
                    onPress={() => setTipoFiltro(tipo)}
                    style={[styles.chip, tipoFiltro === tipo && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, tipoFiltro === tipo && styles.chipTextActive]}>
                      {labelsTipo[tipo]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {precos.map((preco) => (
                  <Pressable
                    key={preco}
                    onPress={() => setPrecoFiltro(preco)}
                    style={[styles.chip, precoFiltro === preco && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, precoFiltro === preco && styles.chipTextActive]}>
                      {labelsPreco[preco]}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setApenasComVaga((prev) => !prev)}
                  style={[styles.chip, apenasComVaga && styles.chipActive]}
                >
                  <Text style={[styles.chipText, apenasComVaga && styles.chipTextActive]}>Somente com vaga</Text>
                </Pressable>
              </ScrollView>
            </>
          )}
        </View>
      </SafeAreaView>

      <Modal
        visible={!!selecionado}
        transparent
        animationType="fade"
        onRequestClose={() => setSelecionado(null)}
      >
        {selecionado && (
          <View style={styles.previewBackdrop}>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: selecionado.imagemUrl || imagemPorTipo[selecionado.tipo] }}
                style={styles.previewImage}
              />
              <View style={styles.previewBody}>
                <Text style={styles.bottomTitle}>{selecionado.titulo}</Text>
                <Text style={styles.bottomText}>{`${labelsTipo[selecionado.tipo]} | ${selecionado.bairro}`}</Text>
                <Text style={styles.bottomText}>{`${selecionado.participantes}/${selecionado.capacidade} participantes`}</Text>
                <Text style={styles.bottomText}>{`${selecionado.data} | ${selecionado.hora}`}</Text>
                <View style={styles.bottomActions}>
                  <Pressable style={styles.ghostButton} onPress={() => setSelecionado(null)}>
                    <Text style={styles.ghostButtonText}>Fechar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      setSelecionado(null);
                      router.push({
                        pathname: "/detalhes",
                        params: { id: selecionado.id },
                      });
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Ver detalhes</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
      <FloatingCreateButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topPanel: {
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.98)",
    padding: 14,
    gap: 10,
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: -4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    borderRadius: 12,
    paddingHorizontal: 10,
    minHeight: 42,
    gap: 8,
  },
  filterToggleButton: {
    borderWidth: 1,
    borderColor: "#D6DFEA",
    backgroundColor: "#fff",
    borderRadius: 999,
    minHeight: 36,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterToggleButtonActive: {
    backgroundColor: "#EAF2FF",
    borderColor: "#BCD3FF",
  },
  filterToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  row: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#D6DFEA",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 7,
    shadowColor: "#0F172A",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  previewImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#E2E8F0",
  },
  previewBody: {
    padding: 14,
  },
  bottomTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  bottomText: {
    fontSize: 13,
    color: "#475569",
  },
  bottomActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  ghostButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1.4,
    backgroundColor: "#0066FF",
    borderRadius: 10,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  customPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  callout: {
    minWidth: 170,
    maxWidth: 220,
  },
  calloutTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  calloutText: {
    color: "#475569",
  },
});
