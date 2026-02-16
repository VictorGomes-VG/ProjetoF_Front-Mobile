import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function FiltroFlutuante() {
  return (
    <View style={styles.container}>
      <FontAwesome5 name="sliders-h" size={16} color="#000" />
      <View>
        <Text style={styles.titulo}>Área do mapa</Text>
        <Text style={styles.subtitulo}>Alugar · 4 filtros de imóvel</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 12,
    color: "#555",
  },
});
