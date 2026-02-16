import { View, Text, Button, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Login() {
  return (
    <View style={styles.container}>
      <Text>🔐 Tela de Login</Text>
      <Button title="Entrar" onPress={() => router.push("/tabs/buscar")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
