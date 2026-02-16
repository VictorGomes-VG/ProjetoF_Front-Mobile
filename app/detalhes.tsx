import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Detalhes() {
  const { id, nome, tipo, descricao } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{nome}</Text>
      <Text style={styles.tipo}>{tipo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tipo: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 8,
    color: "#666",
  },
  descricao: {
    fontSize: 18,
  },
});
