import { useEffect, useState } from "react";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { useAuthSession } from "./data/authStore";
import { addEncontro } from "./data/encontrosStore";
import { useUserLocation } from "./hooks/useUserLocation";
import { type EncontroPreco, type EncontroTipo } from "./data/mockEncontros";
import { friendsZoneTheme } from "./theme";

const tipos: EncontroTipo[] = ["esporte", "networking", "games", "musica", "cafe"];
const precos: EncontroPreco[] = ["gratis", "pago"];
const comunidadeTagsDisponiveis = [
  "LGBTQIA+",
  "Nerd",
  "Geek",
  "Tech",
  "Empreendedorismo",
  "Mães e pais",
  "Universitarios",
  "Bem-estar",
  "Novos na cidade",
  "Artistas",
];

const labelsTipo: Record<EncontroTipo, string> = {
  esporte: "Esporte",
  networking: "Networking",
  games: "Games",
  musica: "Musica",
  cafe: "Cafe",
};

const labelsPreco: Record<EncontroPreco, string> = {
  gratis: "Gratis",
  pago: "Pago",
};

const PLAN_OPTIONS = [
  {
    id: "starter",
    name: "Starter",
    capacity: 4,
    description: "Ate 4 pessoas, incluindo voce.",
    active: true,
  },
  {
    id: "plus",
    name: "Plus",
    capacity: 8,
    description: "Mais vagas para encontros maiores.",
    active: false,
  },
  {
    id: "friend",
    name: "Friend",
    capacity: 12,
    description: "Ideal para comunidades e roles recorrentes.",
    active: false,
  },
] as const;

function randomCoordinate() {
  const baseLat = -23.5606;
  const baseLng = -46.6614;
  const latOffset = (Math.random() - 0.5) * 0.08;
  const lngOffset = (Math.random() - 0.5) * 0.08;
  return { latitude: baseLat + latOffset, longitude: baseLng + lngOffset };
}

const DEFAULT_COORDINATE = {
  latitude: -23.5606,
  longitude: -46.6614,
};

const coverByType: Record<EncontroTipo, string> = {
  esporte: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  musica: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
};

export default function CriarEncontro() {
  const session = useAuthSession();
  const { location: userLocation, refreshLocation } = useUserLocation();
  const [salvando, setSalvando] = useState(false);
  const [mapaAberto, setMapaAberto] = useState(false);
  const [resolvendoEndereco, setResolvendoEndereco] = useState(false);
  const [resolvendoPin, setResolvendoPin] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidade, setCidade] = useState("Sao Paulo");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | undefined>();
  const [dataHora, setDataHora] = useState(() => new Date(2026, 1, 28, 19, 0, 0));
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const [tipo, setTipo] = useState<EncontroTipo>("networking");
  const [comunidadeTags, setComunidadeTags] = useState<string[]>(["Tech"]);
  const [preco, setPreco] = useState<EncontroPreco>("gratis");
  const [selectedCoordinate, setSelectedCoordinate] = useState(DEFAULT_COORDINATE);
  const [draftCoordinate, setDraftCoordinate] = useState(DEFAULT_COORDINATE);
  const [draftAddress, setDraftAddress] = useState("Toque no mapa para escolher um endereco.");
  const maxEventCapacity = session.user?.maxEventCapacity ?? 4;
  const currentPlan = session.user?.plan ?? "starter";

  async function applyCoordinateDetails(latitude: number, longitude: number) {
    setResolvendoEndereco(true);

    try {
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result) {
        const streetParts = [result.street, result.streetNumber].filter(Boolean);
        const formattedAddress = streetParts.join(", ");

        if (formattedAddress) {
          setEndereco(formattedAddress);
        }
        if (result.city || result.subregion) {
          setCidade(result.city || result.subregion || cidade);
        }
        if (result.district || result.subregion) {
          setBairro(result.district || result.subregion || bairro);
        }
      }
    } catch {
      Alert.alert(
        "Pin salvo",
        "Nao foi possivel traduzir o pin para endereco automaticamente. Voce ainda pode ajustar os campos manualmente."
      );
    } finally {
      setResolvendoEndereco(false);
    }
  }

  async function pickImageFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Permita o acesso a galeria para escolher uma imagem do encontro.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImagemUrl(result.assets[0].uri);
    }
  }

  const coverPreview = imagemUrl || coverByType[tipo];
  const data = formatDateValue(dataHora);
  const hora = formatTimeValue(dataHora);

  function openPicker(mode: "date" | "time") {
    setPickerMode(mode);
  }

  function handleDateTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setPickerMode(null);
      return;
    }

    if (selectedDate) {
      setDataHora((current) => {
        if (pickerMode === "time") {
          const next = new Date(current);
          next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
          return next;
        }

        const next = new Date(current);
        next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        return next;
      });
    }

    setPickerMode(null);
  }

  useEffect(() => {
    if (!mapaAberto) {
      return;
    }

    let isActive = true;
    const timeoutId = setTimeout(async () => {
      try {
        setResolvendoPin(true);
        const [result] = await Location.reverseGeocodeAsync({
          latitude: draftCoordinate.latitude,
          longitude: draftCoordinate.longitude,
        });

        if (!isActive) {
          return;
        }

        if (!result) {
          setDraftAddress("Endereco nao identificado. Voce pode confirmar mesmo assim.");
          return;
        }

        const primaryLine = [result.street, result.streetNumber].filter(Boolean).join(", ");
        const secondaryParts = [result.district, result.city || result.subregion].filter(Boolean).join(" • ");
        const formatted = [primaryLine, secondaryParts].filter(Boolean).join("\n");

        setDraftAddress(formatted || "Endereco nao identificado. Voce pode confirmar mesmo assim.");
      } catch {
        if (isActive) {
          setDraftAddress("Nao foi possivel identificar o endereco deste pin.");
        }
      } finally {
        if (isActive) {
          setResolvendoPin(false);
        }
      }
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [draftCoordinate, mapaAberto]);

  function openMapPicker() {
    const baseCoordinate = selectedCoordinate ?? userLocation ?? DEFAULT_COORDINATE;
    setDraftCoordinate(baseCoordinate);
    setDraftAddress(endereco || "Toque no mapa para escolher um endereco.");
    setMapaAberto(true);
  }

  async function pickCurrentLocation() {
    await refreshLocation();
    const current = userLocation ?? selectedCoordinate ?? DEFAULT_COORDINATE;
    setDraftCoordinate(current);
  }

  async function confirmMapSelection() {
    setSelectedCoordinate(draftCoordinate);
    setMapaAberto(false);
    await applyCoordinateDetails(draftCoordinate.latitude, draftCoordinate.longitude);
  }

  function handleMapPress(event: MapPressEvent) {
    setDraftCoordinate(event.nativeEvent.coordinate);
  }

  const salvarEncontro = async () => {
    if (!titulo.trim() || !descricao.trim() || !cidade.trim() || !bairro.trim() || !endereco.trim()) {
      Alert.alert("Campos obrigatorios", "Preencha titulo, descricao, cidade, bairro e endereco.");
      return;
    }

    const coord = selectedCoordinate ?? userLocation ?? randomCoordinate();
    try {
      setSalvando(true);
      await addEncontro({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        tipo,
        comunidadeTags,
        preco,
        data: data.trim(),
        hora: hora.trim(),
        anfitriao: session.user?.fullName ?? "Voce",
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        endereco: endereco.trim(),
        imagemUrl,
        participantes: 1,
        capacidade: maxEventCapacity,
        latitude: coord.latitude,
        longitude: coord.longitude,
      });

      Alert.alert("Encontro criado", "Seu encontro foi publicado com sucesso.", [
        {
          text: "OK",
          onPress: () => router.replace("/tabs/locais"),
        },
      ]);
    } catch {
      Alert.alert("Falha ao criar", "Nao foi possivel publicar o encontro.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Criar encontro</Text>
            <Text style={styles.subtitle}>Monte um role com a cara da sua comunidade.</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.coverCard}>
            <Image source={{ uri: coverPreview }} style={styles.coverPreview} />
            <View style={styles.coverOverlay} />
            <Pressable style={styles.coverEditButton} onPress={() => void pickImageFromGallery()}>
              <Ionicons name="pencil" size={16} color={colors.text} />
            </Pressable>
            <View style={styles.coverContent}>
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>{labelsTipo[tipo]}</Text>
              </View>
              <Text style={styles.coverTitle}>{titulo.trim() || "Seu encontro vai aparecer assim"}</Text>
              <Text style={styles.coverMeta}>
                {[bairro.trim() || "Bairro", data.trim() || "Data", hora.trim() || "Hora"].join(" • ")}
              </Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Identidade do encontro</Text>
            <Text style={styles.sectionDescription}>Capriche no nome, no clima e na imagem para chamar as pessoas certas.</Text>

            <Text style={styles.label}>Titulo</Text>
            <TextInput value={titulo} onChangeText={setTitulo} style={styles.input} placeholder="Ex: Cine e conversa" />

            <Text style={styles.label}>Descricao</Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, styles.multiline]}
              placeholder="Conte como sera o encontro"
              multiline
            />

          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Local e horario</Text>
            <Text style={styles.sectionDescription}>Defina onde a galera vai se encontrar e facilite com o pin no mapa.</Text>

            <Text style={styles.label}>Cidade</Text>
            <TextInput value={cidade} onChangeText={setCidade} style={styles.input} placeholder="Ex: Sao Paulo" />

            <Text style={styles.label}>Bairro</Text>
            <TextInput value={bairro} onChangeText={setBairro} style={styles.input} placeholder="Ex: Pinheiros" />

            <Text style={styles.label}>Endereco</Text>
            <TextInput
              value={endereco}
              onChangeText={setEndereco}
              style={styles.input}
              placeholder="Ex: Rua dos Pinheiros, 220"
            />
            <View style={styles.mapActionsRow}>
              <Pressable style={styles.mapButton} onPress={openMapPicker}>
                <Ionicons name="map-outline" size={16} color={colors.secondary} />
                <Text style={styles.mapButtonText}>Escolher no mapa</Text>
              </Pressable>
            </View>
            {resolvendoEndereco ? (
              <View style={styles.addressStatusRow}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={styles.addressStatusText}>Atualizando endereco a partir do pin...</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Data</Text>
                <Pressable style={styles.inputButton} onPress={() => openPicker("date")}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSoft} />
                  <Text style={styles.inputButtonText}>{data}</Text>
                </Pressable>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Hora</Text>
                <Pressable style={styles.inputButton} onPress={() => openPicker("time")}>
                  <Ionicons name="time-outline" size={16} color={colors.textSoft} />
                  <Text style={styles.inputButtonText}>{hora}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Formato e comunidades</Text>
            <Text style={styles.sectionDescription}>Defina o tipo do encontro e veja o limite de pessoas disponivel no seu plano atual.</Text>

            <Text style={styles.label}>Plano atual e proximos niveis</Text>
            <View style={styles.planList}>
              {PLAN_OPTIONS.map((plan) => (
                <View
                  key={plan.id}
                  style={[styles.planCard, currentPlan === plan.id && styles.planCardActive]}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, currentPlan === plan.id && styles.planNameActive]}>{plan.name}</Text>
                    <View
                      style={[
                        styles.planBadge,
                        currentPlan === plan.id ? styles.planBadgeActive : styles.planBadgeLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.planBadgeText,
                          currentPlan === plan.id ? styles.planBadgeTextActive : styles.planBadgeTextLocked,
                        ]}
                      >
                        {currentPlan === plan.id ? "Seu plano" : "Em breve"}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.planCapacity, currentPlan === plan.id && styles.planCapacityActive]}>
                    {`${plan.capacity} pessoas`}
                  </Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
              ))}
            </View>
            <View style={styles.capacityInfoCard}>
              <Ionicons name="people-outline" size={16} color={colors.secondary} />
              <Text style={styles.capacityInfoText}>
                Seu plano atual permite ate {maxEventCapacity} pessoas no total, contando com o anfitriao.
              </Text>
            </View>

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.chipsRow}>
              {tipos.map((item) => (
                <Pressable key={item} onPress={() => setTipo(item)} style={[styles.chip, tipo === item && styles.chipActive]}>
                  <Text style={[styles.chipText, tipo === item && styles.chipTextActive]}>{labelsTipo[item]}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Comunidades</Text>
            <View style={styles.chipsRow}>
              {comunidadeTagsDisponiveis.map((tag) => {
                const selected = comunidadeTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() =>
                      setComunidadeTags((prev) =>
                        prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
                      )
                    }
                    style={[styles.chip, selected && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Preco</Text>
            <View style={styles.chipsRow}>
              {precos.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPreco(item)}
                  style={[styles.chip, preco === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, preco === item && styles.chipTextActive]}>{labelsPreco[item]}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.submitCard}>
            <View style={styles.submitSummary}>
              <Text style={styles.submitSummaryTitle}>Pronto para publicar?</Text>
              <Text style={styles.submitSummaryText}>
                Revise a capa, o local e as comunidades. Depois seu encontro ja aparece para outras pessoas.
              </Text>
            </View>
            <Pressable style={[styles.saveButton, salvando && styles.saveButtonDisabled]} onPress={() => void salvarEncontro()} disabled={salvando}>
              <Text style={styles.saveButtonText}>{salvando ? "Publicando..." : "Publicar encontro"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {pickerMode ? (
        <DateTimePicker
          value={dataHora}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateTimeChange}
        />
      ) : null}

      <Modal visible={mapaAberto} animationType="slide" onRequestClose={() => setMapaAberto(false)}>
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Pressable style={styles.backButton} onPress={() => setMapaAberto(false)}>
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>
            <View style={styles.mapModalHeaderText}>
              <Text style={styles.title}>Escolher local do encontro</Text>
              <Text style={styles.mapModalSubtitle}>Toque no mapa para posicionar o pin com precisao.</Text>
            </View>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: draftCoordinate.latitude,
              longitude: draftCoordinate.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onPress={handleMapPress}
            onLongPress={handleMapPress}
          >
            <Marker
              coordinate={draftCoordinate}
              draggable
              onDragEnd={(event) => setDraftCoordinate(event.nativeEvent.coordinate)}
            />
          </MapView>

          <View style={styles.mapSheet}>
            <Text style={styles.mapSheetTitle}>Pin selecionado</Text>
            {resolvendoPin ? (
              <View style={styles.mapAddressLoadingRow}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={styles.mapAddressLoadingText}>Buscando endereco do pin...</Text>
              </View>
            ) : (
              <Text style={styles.mapSheetAddress}>{draftAddress}</Text>
            )}
            <Text style={styles.mapSheetHint}>Depois de confirmar, vamos preencher endereco, bairro e cidade automaticamente quando possivel.</Text>
            <View style={styles.mapSheetActions}>
              <Pressable style={styles.secondaryActionButton} onPress={() => void pickCurrentLocation()}>
                <Text style={styles.secondaryActionButtonText}>Usar minha localizacao</Text>
              </Pressable>
              <Pressable style={styles.primaryActionButton} onPress={() => void confirmMapSelection()}>
                <Text style={styles.primaryActionButtonText}>Confirmar pin</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function formatDateValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeValue(value: Date) {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

const { colors, shadows } = friendsZoneTheme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerText: {
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 13,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  coverCard: {
    height: 214,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    ...shadows.card,
  },
  coverPreview: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  coverContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    gap: 8,
  },
  coverEditButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  coverBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coverBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  coverTitle: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
  },
  coverMeta: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSoft,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSoft,
    paddingHorizontal: 12,
    color: colors.text,
  },
  inputButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSoft,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  mapActionsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.secondarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapButtonText: {
    color: colors.secondary,
    fontWeight: "700",
    fontSize: 13,
  },
  addressStatusRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressStatusText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  multiline: {
    minHeight: 94,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  col: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  planList: {
    gap: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSoft,
    padding: 14,
    gap: 6,
  },
  planCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondarySoft,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  planName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  planNameActive: {
    color: colors.secondary,
  },
  planBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  planBadgeActive: {
    backgroundColor: colors.surface,
  },
  planBadgeLocked: {
    backgroundColor: colors.surfaceMuted,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  planBadgeTextActive: {
    color: colors.secondary,
  },
  planBadgeTextLocked: {
    color: colors.textMuted,
  },
  planCapacity: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  planCapacityActive: {
    color: colors.secondary,
  },
  planDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  capacityInfoCard: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  capacityInfoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.white,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  submitCard: {
    borderRadius: 22,
    backgroundColor: colors.text,
    padding: 16,
    gap: 12,
    ...shadows.card,
  },
  submitSummary: {
    gap: 4,
  },
  submitSummaryTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  submitSummaryText: {
    color: "rgba(255,255,255,0.74)",
    lineHeight: 19,
    fontSize: 13,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  mapModalHeaderText: {
    flex: 1,
  },
  mapModalSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  map: {
    flex: 1,
  },
  mapSheet: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  mapSheetTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  mapSheetAddress: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  mapAddressLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapAddressLoadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  mapSheetHint: {
    color: colors.textMuted,
    lineHeight: 18,
    fontSize: 12,
  },
  mapSheetActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  secondaryActionButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  primaryActionButton: {
    flex: 1.2,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  primaryActionButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
});
