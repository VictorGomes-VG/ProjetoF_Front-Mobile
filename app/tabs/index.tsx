import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEncontros } from "../data/encontrosStore";
import { type Encontro, type EncontroPreco, type EncontroTipo } from "../data/mockEncontros";
import FloatingCreateButton from "../components/FloatingCreateButton";
import AvaliacaoInfo, { getMedalhaAvaliacao } from "../components/AvaliacaoInfo";
import { useUserLocation } from "../hooks/useUserLocation";

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

const distanceOptionsKm = [2, 5, 10, 20, 50];
const DEFAULT_LOCATION = { latitude: -23.5606, longitude: -46.6614 };

type CalendarTarget = "inicio" | "fim";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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
  const medalha = getMedalhaAvaliacao(item.nota, item.totalAvaliacoes);

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
        <View style={styles.ratingRow}>
          <AvaliacaoInfo nota={item.nota} totalAvaliacoes={item.totalAvaliacoes} />
          {medalha && (
            <View style={styles.medalhaChip}>
              <Text style={styles.medalhaText}>{medalha}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.descricao}
        </Text>
        <View style={styles.communityRow}>
          {item.comunidadeTags.slice(0, 3).map((tag) => (
            <View key={`${item.id}-${tag}`} style={styles.communityChip}>
              <Text style={styles.communityText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.infoText}>{item.bairro}</Text>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.infoText}>{`${item.data} | ${item.hora}`}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.hostText}>{`Friend: ${item.anfitriao}`}</Text>
          <Text style={[styles.vagaText, vagasRestantes <= 2 && styles.vagaTextUrgente]}>{statusVaga}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function Home() {
  const encontros = useEncontros();
  const { location: userLocation, isLoading: locationLoading, error: locationError } = useUserLocation();
  const pageSize = 4;
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todos");
  const [precoFiltro, setPrecoFiltro] = useState<PrecoFiltro>("todos");
  const [apenasComVaga, setApenasComVaga] = useState(false);
  const [comunidadeFiltro, setComunidadeFiltro] = useState<string[]>([]);
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [distanciaMaxKm, setDistanciaMaxKm] = useState<number | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>("inicio");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [paginaAtual, setPaginaAtual] = useState(1);

  const cidadesDisponiveis = useMemo(
    () => Array.from(new Set(encontros.map((item) => item.cidade))).sort(),
    [encontros]
  );
  const comunidadesDisponiveis = useMemo(
    () => Array.from(new Set(encontros.flatMap((item) => item.comunidadeTags))).sort(),
    [encontros]
  );

  const encontrosFiltrados = useMemo(() => {
    return encontros.filter((encontro) => {
      const okTipo = tipoFiltro === "todos" || encontro.tipo === tipoFiltro;
      const okPreco = precoFiltro === "todos" || encontro.preco === precoFiltro;
      const okVaga = !apenasComVaga || encontro.participantes < encontro.capacidade;
      const okComunidade =
        comunidadeFiltro.length === 0 ||
        encontro.comunidadeTags.some((tag) => comunidadeFiltro.includes(tag));
      const cidadeBusca = cidadeFiltro.trim().toLowerCase();
      const okCidade =
        !cidadeBusca ||
        encontro.cidade.toLowerCase().includes(cidadeBusca) ||
        encontro.bairro.toLowerCase().includes(cidadeBusca);
      const okDataInicio = !dataInicioFiltro || encontro.data >= dataInicioFiltro;
      const okDataFim = !dataFimFiltro || encontro.data <= dataFimFiltro;
      const baseLocation = userLocation ?? DEFAULT_LOCATION;
      const distanciaEvento = distanceInKm(baseLocation, {
        latitude: encontro.latitude,
        longitude: encontro.longitude,
      });
      const okDistancia = distanciaMaxKm === null || distanciaEvento <= distanciaMaxKm;
      return okTipo && okPreco && okVaga && okComunidade && okCidade && okDataInicio && okDataFim && okDistancia;
    });
  }, [
    apenasComVaga,
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

  const totalPaginas = Math.max(1, Math.ceil(encontrosFiltrados.length / pageSize));
  const encontrosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * pageSize;
    return encontrosFiltrados.slice(inicio, inicio + pageSize);
  }, [encontrosFiltrados, paginaAtual, pageSize]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [tipoFiltro, precoFiltro, apenasComVaga, comunidadeFiltro, cidadeFiltro, dataInicioFiltro, dataFimFiltro, distanciaMaxKm]);

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

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

  const monthYearLabel = calendarMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Friends Zones</Text>
          <Text style={styles.subheading}>Todos os encontros da comunidade</Text>
          <Text style={styles.locationHint}>
            {locationLoading
              ? "Obtendo sua localizacao..."
              : userLocation
                ? `Sua localizacao: ${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)}`
                : locationError || "Localizacao indisponivel (usando padrao)"}
          </Text>
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
        data={encontrosPaginados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardEncontro item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.paginationWrap}>
            <Text style={styles.paginationInfo}>
              {`Pagina ${paginaAtual} de ${totalPaginas} - ${encontrosFiltrados.length} encontros`}
            </Text>
            <View style={styles.paginationActions}>
              <Pressable
                style={[styles.paginationButton, paginaAtual === 1 && styles.paginationButtonDisabled]}
                onPress={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
              >
                <Text style={[styles.paginationButtonText, paginaAtual === 1 && styles.paginationButtonTextDisabled]}>
                  Anterior
                </Text>
              </Pressable>
              <Pressable
                style={[styles.paginationButtonPrimary, paginaAtual === totalPaginas && styles.paginationButtonDisabled]}
                onPress={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                <Text style={[styles.paginationButtonPrimaryText, paginaAtual === totalPaginas && styles.paginationButtonTextDisabled]}>
                  Proxima
                </Text>
              </Pressable>
            </View>
          </View>
        }
      />
      <FloatingCreateButton />

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

            <Text style={styles.modalSectionTitle}>Comunidades</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {cidadesDisponiveis.map((cidade) => (
                  <Pressable key={cidade} onPress={() => setCidadeFiltro(cidade)} style={styles.chip}>
                    <Text style={styles.chipText}>{cidade}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <Text style={styles.modalSectionTitle}>Distancia do evento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
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
            <View style={styles.distanceRow}>
              <Text style={styles.distanceInfo}>
                {distanciaMaxKm === null
                  ? "Sem limite de distancia"
                  : `Mostrando eventos ate ${distanciaMaxKm} km da sua localizacao`}
              </Text>
              {distanciaMaxKm !== null && (
                <Pressable onPress={() => setDistanciaMaxKm(null)}>
                  <Text style={styles.dateClearText}>Limpar</Text>
                </Pressable>
              )}
            </View>

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
            <View style={styles.dateClearRow}>
              <Pressable onPress={() => setDataInicioFiltro("")}>
                <Text style={styles.dateClearText}>Limpar inicio</Text>
              </Pressable>
              <Pressable onPress={() => setDataFimFiltro("")}>
                <Text style={styles.dateClearText}>Limpar fim</Text>
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
  locationHint: {
    marginTop: 2,
    fontSize: 11,
    color: "#475569",
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
    paddingBottom: 210,
    gap: 14,
  },
  paginationWrap: {
    marginTop: 8,
    marginBottom: 10,
    gap: 10,
  },
  paginationInfo: {
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  paginationActions: {
    flexDirection: "row",
    gap: 8,
  },
  paginationButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonPrimary: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    opacity: 0.45,
  },
  paginationButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },
  paginationButtonPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  paginationButtonTextDisabled: {
    color: "#64748B",
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
  ratingRow: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  medalhaChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
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
  description: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  communityRow: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  communityChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFF1F3",
    borderWidth: 1,
    borderColor: "#FFC8D0",
  },
  communityText: {
    fontSize: 11,
    color: "#B42343",
    fontWeight: "600",
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
  dateClearRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateClearText: {
    fontSize: 12,
    color: "#0B5ED7",
    fontWeight: "600",
  },
  distanceRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  distanceInfo: {
    flex: 1,
    color: "#64748B",
    fontSize: 12,
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
