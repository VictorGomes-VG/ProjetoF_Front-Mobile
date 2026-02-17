import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Callout, Marker } from "react-native-maps";
import { router } from "expo-router";
import { useEncontros } from "../data/encontrosStore";
import { type Encontro, type EncontroPreco, type EncontroTipo } from "../data/mockEncontros";
import FloatingCreateButton from "../components/FloatingCreateButton";
import AvaliacaoInfo, { getMedalhaAvaliacao } from "../components/AvaliacaoInfo";
import { useUserLocation } from "../hooks/useUserLocation";

type TipoFiltro = "todos" | EncontroTipo;
type PrecoFiltro = "todos" | EncontroPreco;
type CalendarTarget = "inicio" | "fim";

const tipos: TipoFiltro[] = ["todos", "esporte", "networking", "games", "musica", "cafe"];
const precos: PrecoFiltro[] = ["todos", "gratis", "pago"];
const distanceOptionsKm = [2, 5, 10, 20, 50];
const DEFAULT_LOCATION = { latitude: -23.5606, longitude: -46.6614 };
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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

function formatIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function distanceInKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export default function Buscar() {
  const encontros = useEncontros();
  const { location: userLocation } = useUserLocation();

  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todos");
  const [precoFiltro, setPrecoFiltro] = useState<PrecoFiltro>("todos");
  const [apenasComVaga, setApenasComVaga] = useState(false);
  const [comunidadeFiltro, setComunidadeFiltro] = useState<string[]>([]);
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [distanciaMaxKm, setDistanciaMaxKm] = useState<number | null>(null);
  const [busca, setBusca] = useState("");

  const [selecionado, setSelecionado] = useState<Encontro | null>(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>("inicio");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const comunidadesDisponiveis = useMemo(
    () => Array.from(new Set(encontros.flatMap((item) => item.comunidadeTags))).sort(),
    [encontros]
  );
  const cidadesDisponiveis = useMemo(
    () => Array.from(new Set(encontros.map((item) => item.cidade))).sort(),
    [encontros]
  );

  const encontrosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    return encontros.filter((encontro) => {
      const matchTipo = tipoFiltro === "todos" || encontro.tipo === tipoFiltro;
      const matchPreco = precoFiltro === "todos" || encontro.preco === precoFiltro;
      const matchComunidade =
        comunidadeFiltro.length === 0 ||
        encontro.comunidadeTags.some((tag) => comunidadeFiltro.includes(tag));
      const cidadeBusca = cidadeFiltro.trim().toLowerCase();
      const matchCidade =
        !cidadeBusca ||
        encontro.cidade.toLowerCase().includes(cidadeBusca) ||
        encontro.bairro.toLowerCase().includes(cidadeBusca);
      const matchDataInicio = !dataInicioFiltro || encontro.data >= dataInicioFiltro;
      const matchDataFim = !dataFimFiltro || encontro.data <= dataFimFiltro;
      const baseLocation = userLocation ?? DEFAULT_LOCATION;
      const distanciaEvento = distanceInKm(baseLocation, {
        latitude: encontro.latitude,
        longitude: encontro.longitude,
      });
      const matchDistancia = distanciaMaxKm === null || distanciaEvento <= distanciaMaxKm;
      const matchBusca =
        !texto ||
        encontro.titulo.toLowerCase().includes(texto) ||
        encontro.bairro.toLowerCase().includes(texto) ||
        encontro.cidade.toLowerCase().includes(texto);
      const matchVaga = !apenasComVaga || encontro.participantes < encontro.capacidade;

      return (
        matchTipo &&
        matchPreco &&
        matchComunidade &&
        matchCidade &&
        matchDataInicio &&
        matchDataFim &&
        matchDistancia &&
        matchBusca &&
        matchVaga
      );
    });
  }, [
    apenasComVaga,
    busca,
    cidadeFiltro,
    comunidadeFiltro,
    dataFimFiltro,
    dataInicioFiltro,
    distanciaMaxKm,
    encontros,
    precoFiltro,
    tipoFiltro,
    userLocation,
  ]);

  const totalFiltrosAtivos =
    (tipoFiltro !== "todos" ? 1 : 0) +
    (precoFiltro !== "todos" ? 1 : 0) +
    (apenasComVaga ? 1 : 0) +
    (comunidadeFiltro.length > 0 ? 1 : 0) +
    (cidadeFiltro.trim() ? 1 : 0) +
    (dataInicioFiltro ? 1 : 0) +
    (dataFimFiltro ? 1 : 0) +
    (distanciaMaxKm !== null ? 1 : 0);

  const openCalendar = (target: CalendarTarget) => {
    setCalendarTarget(target);
    const existing = parseIsoDate(target === "inicio" ? dataInicioFiltro : dataFimFiltro);
    const base = existing || new Date();
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setCalendarVisible(true);
  };

  const pickDate = (day: number) => {
    const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const iso = formatIsoDate(selected);
    if (calendarTarget === "inicio") {
      setDataInicioFiltro(iso);
    } else {
      setDataFimFiltro(iso);
    }
    setCalendarVisible(false);
  };

  const monthYearLabel = calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const firstWeekDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

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
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={styles.userPinWrap}>
              <View style={styles.userPinInner} />
            </View>
          </Marker>
        )}
        {encontrosFiltrados.map((encontro) => (
          <Marker
            key={encontro.id}
            coordinate={{ latitude: encontro.latitude, longitude: encontro.longitude }}
            onPress={() => setSelecionado(encontro)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pinWrap}>
              <View style={[styles.customPin, { backgroundColor: corPorTipo[encontro.tipo] }]}>
                <Ionicons name={iconePorTipo[encontro.tipo]} color="#fff" size={15} />
              </View>
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
            <Pressable onPress={() => setModalFiltroAberto(true)} style={styles.filterToggleButton}>
              <Ionicons name="options-outline" size={16} color="#0F172A" />
              <Text style={styles.filterToggleText}>Filtros</Text>
              {totalFiltrosAtivos > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{totalFiltrosAtivos}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por titulo, bairro ou cidade"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
        </View>
      </SafeAreaView>

      <Modal visible={!!selecionado} transparent animationType="fade" onRequestClose={() => setSelecionado(null)}>
        {selecionado && (
          <View style={styles.previewBackdrop}>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: selecionado.imagemUrl || imagemPorTipo[selecionado.tipo] }}
                style={styles.previewImage}
              />
              <View style={styles.previewBody}>
                <Text style={styles.bottomTitle}>{selecionado.titulo}</Text>
                <View style={styles.previewRatingRow}>
                  <AvaliacaoInfo nota={selecionado.nota} totalAvaliacoes={selecionado.totalAvaliacoes} />
                  {getMedalhaAvaliacao(selecionado.nota, selecionado.totalAvaliacoes) && (
                    <View style={styles.previewMedalha}>
                      <Text style={styles.previewMedalhaText}>
                        {getMedalhaAvaliacao(selecionado.nota, selecionado.totalAvaliacoes)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.bottomText}>{`${labelsTipo[selecionado.tipo]} | ${selecionado.bairro}`}</Text>
                <Text style={styles.bottomText}>{`${selecionado.participantes}/${selecionado.capacidade} participantes`}</Text>
                <Text style={styles.bottomText}>{`${selecionado.data} | ${selecionado.hora}`}</Text>
                <Text style={styles.bottomText}>{selecionado.comunidadeTags.join(" • ")}</Text>
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

            <Text style={styles.modalSectionTitle}>Preco</Text>
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

            <Text style={styles.modalSectionTitle}>Comunidades</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {comunidadesDisponiveis.map((tag) => {
                const selected = comunidadeFiltro.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() =>
                      setComunidadeFiltro((prev) =>
                        prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
                      )
                    }
                    style={[styles.chip, selected && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.modalSectionTitle}>Cidade ou bairro</Text>
            <TextInput
              value={cidadeFiltro}
              onChangeText={setCidadeFiltro}
              placeholder="Ex: Sao Paulo ou Pinheiros"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />
            {cidadesDisponiveis.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {cidadesDisponiveis.map((cidade) => (
                  <Pressable key={cidade} onPress={() => setCidadeFiltro(cidade)} style={styles.chip}>
                    <Text style={styles.chipText}>{cidade}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <Text style={styles.modalSectionTitle}>Distancia do evento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {distanceOptionsKm.map((km) => (
                <Pressable
                  key={km}
                  onPress={() => setDistanciaMaxKm(km)}
                  style={[styles.chip, distanciaMaxKm === km && styles.chipActive]}
                >
                  <Text style={[styles.chipText, distanciaMaxKm === km && styles.chipTextActive]}>
                    {`Ate ${km} km`}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.modalSectionTitle}>Range de data</Text>
            <View style={styles.dateRow}>
              <Pressable style={[styles.modalInput, styles.dateInput, styles.datePickerButton]} onPress={() => openCalendar("inicio")}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={[styles.datePickerText, !dataInicioFiltro && styles.datePickerPlaceholder]}>
                  {dataInicioFiltro || "Inicio"}
                </Text>
              </Pressable>
              <Pressable style={[styles.modalInput, styles.dateInput, styles.datePickerButton]} onPress={() => openCalendar("fim")}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={[styles.datePickerText, !dataFimFiltro && styles.datePickerPlaceholder]}>
                  {dataFimFiltro || "Fim"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.clearButton}
                onPress={() => {
                  setTipoFiltro("todos");
                  setPrecoFiltro("todos");
                  setApenasComVaga(false);
                  setComunidadeFiltro([]);
                  setCidadeFiltro("");
                  setDataInicioFiltro("");
                  setDataFimFiltro("");
                  setDistanciaMaxKm(null);
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

      <Modal visible={calendarVisible} transparent animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                <Ionicons name="chevron-back" size={22} color="#334155" />
              </Pressable>
              <Text style={styles.calendarTitle}>
                {monthYearLabel.charAt(0).toUpperCase() + monthYearLabel.slice(1)}
              </Text>
              <Pressable onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                <Ionicons name="chevron-forward" size={22} color="#334155" />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarCells.map((day, idx) => {
                if (!day) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }
                const iso = formatIsoDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                const selectedIso = calendarTarget === "inicio" ? dataInicioFiltro : dataFimFiltro;
                const selected = iso === selectedIso;
                return (
                  <Pressable key={iso} style={[styles.dayCell, selected && styles.dayCellSelected]} onPress={() => pickDate(day)}>
                    <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.calendarClose} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.calendarCloseText}>Fechar calendario</Text>
            </Pressable>
          </View>
        </View>
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
  filterToggleText: {
    fontSize: 12,
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
  modalInput: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#D6DFEA",
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#0F172A",
    backgroundColor: "#FAFCFF",
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  datePickerText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  datePickerPlaceholder: {
    color: "#94A3B8",
    fontWeight: "500",
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
  previewRatingRow: {
    marginTop: 2,
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewMedalha: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  previewMedalhaText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "700",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1E293B",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  pinWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
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
  userPinWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "rgba(37,99,235,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  userPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.285%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: "#0066FF",
  },
  dayText: {
    color: "#334155",
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#fff",
  },
  calendarClose: {
    marginTop: 4,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCloseText: {
    color: "#0F172A",
    fontWeight: "700",
  },
});
