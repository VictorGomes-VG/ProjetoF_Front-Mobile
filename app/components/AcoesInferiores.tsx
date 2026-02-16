import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function AcoesInferiores() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.lista}>
        <Text style={styles.textoLista}>📋 Mostrar lista</Text>
      </Pressable>
      <Pressable style={styles.alerta}>
        <Text style={styles.textoAlerta}>🔔 Criar alerta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  lista: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 4,
  },
  alerta: {
    backgroundColor: "#2c2c88",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  textoLista: {
    fontWeight: "bold",
  },
  textoAlerta: {
    color: "#fff",
    fontWeight: "bold",
  },
});
