import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEncontros } from "../data/encontrosStore";
import AvaliacaoInfo from "../components/AvaliacaoInfo";
import FloatingMenuButton from "../components/FloatingMenuButton";

export default function Perfil() {
  const encontros = useEncontros();
  const [modoEdicao, setModoEdicao] = useState(false);
  const [nome, setNome] = useState("Victor");
  const [idade, setIdade] = useState("24");
  const [cidade, setCidade] = useState("Sao Paulo");
  const [headline, setHeadline] = useState("Product Designer | Curto networking e cafe");
  const [interesses, setInteresses] = useState("esporte, games, cafe");
  const [bio, setBio] = useState("Buscando conexoes reais e encontros com boas conversas.");
  const [capaUrl, setCapaUrl] = useState(
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=500&q=80"
  );
  const [notificacoes, setNotificacoes] = useState(true);
  const [mostrarLocalizacao, setMostrarLocalizacao] = useState(true);

  const avaliacaoUsuario = useMemo(() => {
    const encontrosDoUsuario = encontros.filter((item) => item.anfitriao.toLowerCase() === "voce");
    if (encontrosDoUsuario.length === 0) {
      return { nota: 4.8, totalAvaliacoes: 18 };
    }

    const somaNotaPonderada = encontrosDoUsuario.reduce(
      (acc, item) => acc + item.nota * item.totalAvaliacoes,
      0
    );
    const somaAvaliacoes = encontrosDoUsuario.reduce((acc, item) => acc + item.totalAvaliacoes, 0);
    const nota = somaAvaliacoes > 0 ? somaNotaPonderada / somaAvaliacoes : 0;
    return { nota, totalAvaliacoes: somaAvaliacoes };
  }, [encontros]);

  const encontrosOrganizados = useMemo(
    () => encontros.filter((item) => item.anfitriao.toLowerCase() === "voce").length,
    [encontros]
  );
  const encontrosFoi = useMemo(
    () => encontros.filter((item) => item.anfitriao.toLowerCase() !== "voce").length,
    [encontros]
  );

  const interessesLista = interesses
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  const renderStars = (nota: number) => {
    const fullStars = Math.floor(nota);
    const decimal = nota - fullStars;
    const hasHalf = decimal >= 0.25 && decimal < 0.75;
    const roundedUp = decimal >= 0.75;
    const totalFilled = roundedUp ? Math.min(fullStars + 1, 5) : fullStars;

    return (
      <View style={styles.starRow}>
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < totalFilled) {
            return <Ionicons key={`star-full-${index}`} name="star" size={14} color="#F59E0B" />;
          }
          if (hasHalf && index === fullStars) {
            return <Ionicons key={`star-half-${index}`} name="star-half" size={14} color="#F59E0B" />;
          }
          return <Ionicons key={`star-empty-${index}`} name="star-outline" size={14} color="#F59E0B" />;
        })}
      </View>
    );
  };

  const salvarAlteracoes = () => {
    setModoEdicao(false);
    Alert.alert("Perfil salvo", "Alteracoes salvas localmente (mock).");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloatingMenuButton />
      <View style={styles.heroCard}>
        <Image source={{ uri: capaUrl }} style={styles.cover} />
        <Pressable style={styles.editPencil} onPress={() => setModoEdicao((prev) => !prev)}>
          <Ionicons name={modoEdicao ? "checkmark" : "pencil"} size={16} color="#0F172A" />
        </Pressable>

        <View style={styles.profileBlock}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          <View style={styles.identity}>
            <Text style={styles.name}>{`${nome}, ${idade}`}</Text>
            <Text style={styles.headline}>{headline}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.locationText}>{cidade}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            {renderStars(avaliacaoUsuario.nota)}
            <Text style={styles.statValueSmall}>{avaliacaoUsuario.nota.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{encontrosFoi}</Text>
            <Text style={styles.statLabel}>Ja foi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{encontrosOrganizados}</Text>
            <Text style={styles.statLabel}>Organizou</Text>
          </View>
        </View>
        <View style={styles.userRatingRow}>
          <Text style={styles.userRatingLabel}>Reputacao de Friend</Text>
          <AvaliacaoInfo nota={avaliacaoUsuario.nota} totalAvaliacoes={avaliacaoUsuario.totalAvaliacoes} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre mim</Text>
        <Text style={styles.bioText}>{bio}</Text>
        <View style={styles.tagsRow}>
          {interessesLista.map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {modoEdicao && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Editar perfil</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput value={nome} onChangeText={setNome} style={styles.input} />

            <Text style={styles.label}>Idade</Text>
            <TextInput value={idade} onChangeText={setIdade} keyboardType="number-pad" style={styles.input} />

            <Text style={styles.label}>Cidade</Text>
            <TextInput value={cidade} onChangeText={setCidade} style={styles.input} />

            <Text style={styles.label}>Headline</Text>
            <TextInput value={headline} onChangeText={setHeadline} style={styles.input} />

            <Text style={styles.label}>Interesses (separados por virgula)</Text>
            <TextInput value={interesses} onChangeText={setInteresses} style={styles.input} />

            <Text style={styles.label}>Bio</Text>
            <TextInput value={bio} onChangeText={setBio} style={[styles.input, styles.multiline]} multiline />

            <Text style={styles.label}>URL da foto de perfil</Text>
            <TextInput value={avatarUrl} onChangeText={setAvatarUrl} style={styles.input} autoCapitalize="none" />

            <Text style={styles.label}>URL da capa</Text>
            <TextInput value={capaUrl} onChangeText={setCapaUrl} style={styles.input} autoCapitalize="none" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferencias</Text>
            <View style={styles.prefRow}>
              <Text style={styles.prefText}>Notificar novos encontros proximos</Text>
              <Switch value={notificacoes} onValueChange={setNotificacoes} trackColor={{ true: "#7AA8FF" }} />
            </View>
            <View style={styles.separator} />
            <View style={styles.prefRow}>
              <Text style={styles.prefText}>Mostrar localizacao aproximada no mapa</Text>
              <Switch value={mostrarLocalizacao} onValueChange={setMostrarLocalizacao} trackColor={{ true: "#7AA8FF" }} />
            </View>
          </View>

          <View style={styles.editActions}>
            <Pressable style={styles.cancelButton} onPress={() => setModoEdicao(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={salvarAlteracoes}>
              <Text style={styles.saveButtonText}>Salvar alteracoes</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3FA",
  },
  content: {
    padding: 14,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 12,
  },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },
  cover: {
    height: 110,
    backgroundColor: "#0A66C2",
  },
  editPencil: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBlock: {
    paddingHorizontal: 14,
    marginTop: -28,
    flexDirection: "row",
    gap: 10,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#D6DFEA",
  },
  identity: {
    flex: 1,
    paddingTop: 28,
  },
  name: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
  },
  headline: {
    marginTop: 2,
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  locationRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#64748B",
    fontSize: 12,
  },
  statsRow: {
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A66C2",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    marginBottom: 2,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A66C2",
    marginTop: 1,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
  userRatingRow: {
    marginTop: -2,
    marginBottom: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRatingLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  bioText: {
    color: "#334155",
    lineHeight: 20,
  },
  tagsRow: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: "#FFF1F3",
    borderWidth: 1,
    borderColor: "#FFC8D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: "#B42343",
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6DFEA",
    backgroundColor: "#FAFCFF",
    color: "#0F172A",
    paddingHorizontal: 10,
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  prefText: {
    flex: 1,
    color: "#1E293B",
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C9D4E5",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 15,
  },
  saveButton: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#0A66C2",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
