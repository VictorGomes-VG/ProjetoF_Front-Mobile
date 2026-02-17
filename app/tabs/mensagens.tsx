import { StyleSheet, Text, View } from "react-native";
import FloatingMenuButton from "../components/FloatingMenuButton";

export default function Mensagens() {
  return (
    <View style={styles.container}>
      <FloatingMenuButton />
      <Text style={styles.title}>Mensagens</Text>
      <Text style={styles.subtitle}>Aqui voce vai acompanhar conversas e convites dos encontros.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FB",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
  },
});
