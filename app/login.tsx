import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { login, register, useAuthSession } from "./data/authStore";
import { hydrateEncontros, resetEncontrosState } from "./data/encontrosStore";

const demoCredentials = {
  email: "marina@friendszone.app",
  password: "123456",
};

export default function Login() {
  const session = useAuthSession();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState("Victor");
  const [city, setCity] = useState("Sao Paulo");
  const [bio, setBio] = useState("Buscando novas amizades, roles leves e conversas boas.");
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);

  if (session.user) {
    return <Redirect href="/tabs" />;
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatorios", "Preencha email e senha.");
      return;
    }

    if (isRegisterMode && (!fullName.trim() || !city.trim() || !bio.trim())) {
      Alert.alert("Campos obrigatorios", "Preencha nome, cidade e bio para criar sua conta.");
      return;
    }

    try {
      if (isRegisterMode) {
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          city: city.trim(),
          bio: bio.trim(),
        });
      } else {
        await login(email.trim(), password.trim());
      }

      resetEncontrosState();
      await hydrateEncontros(true);
      router.replace("/tabs");
    } catch (error) {
      Alert.alert("Nao foi possivel continuar", error instanceof Error ? error.message : "Tente novamente.");
    }
  }

  function fillDemoAccount() {
    setIsRegisterMode(false);
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>FriendsZone MVP</Text>
        <Text style={styles.title}>Encontre sua proxima conexao fora da tela.</Text>
        <Text style={styles.subtitle}>
          Entre com uma conta seedada ou crie sua conta para listar, criar e participar de encontros.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleButton, !isRegisterMode && styles.toggleButtonActive]}
            onPress={() => setIsRegisterMode(false)}
          >
            <Text style={[styles.toggleText, !isRegisterMode && styles.toggleTextActive]}>Entrar</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, isRegisterMode && styles.toggleButtonActive]}
            onPress={() => setIsRegisterMode(true)}
          >
            <Text style={[styles.toggleText, isRegisterMode && styles.toggleTextActive]}>Criar conta</Text>
          </Pressable>
        </View>

        {isRegisterMode && (
          <>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput value={fullName} onChangeText={setFullName} style={styles.input} placeholder="Seu nome" />

            <Text style={styles.label}>Cidade</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="Sua cidade" />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.multiline]}
              placeholder="Conte um pouco sobre voce"
              multiline
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="voce@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="Sua senha"
          secureTextEntry
        />

        {session.error ? <Text style={styles.errorText}>{session.error}</Text> : null}

        <Pressable
          style={[styles.primaryButton, session.isLoading && styles.primaryButtonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={session.isLoading}
        >
          {session.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{isRegisterMode ? "Criar conta" : "Entrar agora"}</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={fillDemoAccount}>
          <Text style={styles.secondaryButtonText}>Usar conta demo</Text>
        </Pressable>

        <Text style={styles.helperText}>Conta pronta para teste: marina@friendszone.app / 123456</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    padding: 20,
    gap: 18,
  },
  hero: {
    gap: 8,
  },
  kicker: {
    color: "#0B5ED7",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    gap: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 4,
    marginBottom: 6,
  },
  toggleButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  toggleText: {
    color: "#475569",
    fontWeight: "700",
  },
  toggleTextActive: {
    color: "#0F172A",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    color: "#0F172A",
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#0B5ED7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0B5ED7",
    fontWeight: "700",
  },
  helperText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
