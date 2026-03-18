import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { addEncontro } from "./data/encontrosStore";
import { type EncontroPreco, type EncontroTipo } from "./data/mockEncontros";

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

function randomCoordinate() {
  const baseLat = -23.5606;
  const baseLng = -46.6614;
  const latOffset = (Math.random() - 0.5) * 0.08;
  const lngOffset = (Math.random() - 0.5) * 0.08;
  return { latitude: baseLat + latOffset, longitude: baseLng + lngOffset };
}

export default function CriarEncontro() {
  const [salvando, setSalvando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidade, setCidade] = useState("Sao Paulo");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [data, setData] = useState("2026-02-28");
  const [hora, setHora] = useState("19:00");
  const [capacidade, setCapacidade] = useState("12");
  const [tipo, setTipo] = useState<EncontroTipo>("networking");
  const [comunidadeTags, setComunidadeTags] = useState<string[]>(["Tech"]);
  const [preco, setPreco] = useState<EncontroPreco>("gratis");

  const salvarEncontro = async () => {
    const capacidadeNumero = Number(capacidade);
    if (!titulo.trim() || !descricao.trim() || !cidade.trim() || !bairro.trim() || !endereco.trim()) {
      Alert.alert("Campos obrigatorios", "Preencha titulo, descricao, cidade, bairro e endereco.");
      return;
    }
    if (!Number.isFinite(capacidadeNumero) || capacidadeNumero < 2) {
      Alert.alert("Capacidade invalida", "Informe uma capacidade maior ou igual a 2.");
      return;
    }

    const coord = randomCoordinate();
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
        anfitriao: "Voce",
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        endereco: endereco.trim(),
        imagemUrl: imagemUrl.trim() || undefined,
        participantes: 1,
        capacidade: capacidadeNumero,
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
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
          </Pressable>
          <Text style={styles.title}>Criar encontro</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

          <Text style={styles.label}>Imagem do encontro (URL)</Text>
          <TextInput
            value={imagemUrl}
            onChangeText={setImagemUrl}
            style={styles.input}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
              <TextInput value={data} onChangeText={setData} style={styles.input} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Hora (HH:MM)</Text>
              <TextInput value={hora} onChangeText={setHora} style={styles.input} />
            </View>
          </View>

          <Text style={styles.label}>Capacidade</Text>
          <TextInput
            value={capacidade}
            onChangeText={setCapacidade}
            style={styles.input}
            keyboardType="number-pad"
            placeholder="Ex: 15"
          />

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

          <Pressable style={[styles.saveButton, salvando && styles.saveButtonDisabled]} onPress={() => void salvarEncontro()} disabled={salvando}>
            <Text style={styles.saveButtonText}>{salvando ? "Publicando..." : "Publicar encontro"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6DFEA",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    color: "#0F172A",
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
  saveButton: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
