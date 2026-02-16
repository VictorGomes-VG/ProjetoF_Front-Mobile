import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Perfil() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color="#888" style={styles.icon} />
        <Ionicons name="settings-outline" size={24} color="#888" style={styles.icon} />
      </View>

      <View style={styles.placeholderContainer}>
        <Ionicons name="person-circle-outline" size={160} color="#ccc" />
        <Pressable style={styles.botaoEditarFoto}>
          <Ionicons name="pencil" size={16} color="#fff" />
        </Pressable>
      </View>

      <Text style={styles.concluido}>100% CONCLUÍDO</Text>
      <Text style={styles.nome}>Victor, 24 <Ionicons name="checkmark-circle" size={16} color="#2c2c88" /></Text>

      <View style={styles.cardsContainer}>
        <View style={styles.card}><Text style={styles.cardTexto}>⭐ 14 Friends</Text></View>
        <View style={styles.card}><Text style={styles.cardTexto}>⚡ Grupos</Text></View>
        <View style={styles.card}><Text style={styles.cardTexto}>🔥 Encontros</Text></View>
      </View>

      <View style={styles.promoContainer}>
        <Text style={styles.promoTitulo}>🔥 Marque mais encontros</Text>
        <Text style={styles.promoTexto}>Eleve sua experiência no app</Text>
        <Pressable style={styles.botaoAssinar}>
          <Text style={styles.textoBotao}>Assine agora</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    position: "absolute",
    top: 40,
    right: 20,
    gap: 20,
  },
  icon: {
    marginLeft: 10,
  },
  placeholderContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoEditarFoto: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#2c2c88",
    padding: 6,
    borderRadius: 20,
  },
  nome: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
  },
  concluido: {
    backgroundColor: "#ff527b",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 12,
  },
  cardsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 16,
  },
  cardTexto: {
    fontWeight: "bold",
    textAlign: "center",
  },
  promoContainer: {
    marginTop: 40,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  promoTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  promoTexto: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 12,
  },
  botaoAssinar: {
    backgroundColor: "#2c2c88",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
  },
});