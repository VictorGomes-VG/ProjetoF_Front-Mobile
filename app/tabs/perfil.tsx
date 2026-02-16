import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { encontrosMock } from "../data/mockEncontros";

export default function Perfil() {
  const [nome, setNome] = useState("Victor");
  const [idade, setIdade] = useState("24");
  const [cidade, setCidade] = useState("Sao Paulo");
  const [interesses, setInteresses] = useState("esporte, games, cafe");
  const [bio, setBio] = useState("Buscando encontros presenciais para fazer novas conexoes.");
  const [notificacoes, setNotificacoes] = useState(true);
  const [mostrarLocalizacao, setMostrarLocalizacao] = useState(true);

  const totalComVaga = useMemo(
    () => encontrosMock.filter((item) => item.participantes < item.capacidade).length,
    []
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={38} color="#0066FF" />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{nome}</Text>
          <Text style={styles.city}>{cidade}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{encontrosMock.length}</Text>
          <Text style={styles.statLabel}>Encontros ativos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalComVaga}</Text>
          <Text style={styles.statLabel}>Com vaga</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{idade}</Text>
          <Text style={styles.statLabel}>Idade</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dados pessoais</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput value={nome} onChangeText={setNome} style={styles.input} />

        <Text style={styles.label}>Idade</Text>
        <TextInput value={idade} onChangeText={setIdade} keyboardType="numeric" style={styles.input} />

        <Text style={styles.label}>Cidade</Text>
        <TextInput value={cidade} onChangeText={setCidade} style={styles.input} />

        <Text style={styles.label}>Interesses</Text>
        <TextInput value={interesses} onChangeText={setInteresses} style={styles.input} />

        <Text style={styles.label}>Bio</Text>
        <TextInput value={bio} onChangeText={setBio} style={[styles.input, styles.multiline]} multiline />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferencias</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Notificar novos encontros proximos</Text>
          <Switch value={notificacoes} onValueChange={setNotificacoes} trackColor={{ true: "#8DB8FF" }} />
        </View>
        <View style={styles.separator} />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Mostrar localizacao aproximada no mapa</Text>
          <Switch value={mostrarLocalizacao} onValueChange={setMostrarLocalizacao} trackColor={{ true: "#8DB8FF" }} />
        </View>
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={() => Alert.alert("Perfil salvo", "Alteracoes salvas localmente (mock).")}
      >
        <Text style={styles.saveButtonText}>Salvar alteracoes</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 44,
    gap: 14,
  },
  profileHero: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    gap: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  city: {
    color: "#64748B",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0066FF",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
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
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D9E1EC",
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 11,
    backgroundColor: "#FBFCFE",
    color: "#0F172A",
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  toggleText: {
    color: "#1E293B",
    flex: 1,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  saveButton: {
    backgroundColor: "#0066FF",
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
