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
import { interestsCatalog } from "./data/interestsCatalog";
import { friendsZoneTheme } from "./theme";

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
  const [interests, setInterests] = useState<string[]>(["Cafe", "Networking", "Cinema"]);
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);

  if (!session.isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

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

    if (isRegisterMode && interests.length === 0) {
      Alert.alert("Interesses", "Selecione pelo menos um interesse para montar seu perfil.");
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
          interests,
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
        <Text style={styles.title}>Encontre sua proxima conexao no seu bairro.</Text>
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

            <Text style={styles.label}>Interesses</Text>
            <View style={styles.interestsWrap}>
              {interestsCatalog.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <Pressable
                    key={interest}
                    style={[styles.interestChip, selected && styles.interestChipActive]}
                    onPress={() =>
                      setInterests((current) =>
                        current.includes(interest)
                          ? current.filter((item) => item !== interest)
                          : [...current, interest]
                      )
                    }
                  >
                    <Text style={[styles.interestChipText, selected && styles.interestChipTextActive]}>{interest}</Text>
                  </Pressable>
                );
              })}
            </View>
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
    backgroundColor: friendsZoneTheme.colors.background,
    justifyContent: "center",
    padding: 20,
    gap: 18,
  },
  hero: {
    gap: 8,
  },
  kicker: {
    color: friendsZoneTheme.colors.secondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: friendsZoneTheme.colors.text,
  },
  subtitle: {
    color: friendsZoneTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: friendsZoneTheme.colors.surface,
    borderRadius: 28,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    ...friendsZoneTheme.shadows.card,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: friendsZoneTheme.colors.surfaceMuted,
    borderRadius: 16,
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
    backgroundColor: friendsZoneTheme.colors.surface,
  },
  toggleText: {
    color: friendsZoneTheme.colors.textMuted,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: friendsZoneTheme.colors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: friendsZoneTheme.colors.text,
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    backgroundColor: friendsZoneTheme.colors.surfaceAlt,
    paddingHorizontal: 12,
    color: friendsZoneTheme.colors.text,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  interestChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: friendsZoneTheme.colors.border,
    backgroundColor: friendsZoneTheme.colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  interestChipActive: {
    backgroundColor: friendsZoneTheme.colors.secondary,
    borderColor: friendsZoneTheme.colors.secondary,
  },
  interestChipText: {
    color: friendsZoneTheme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  interestChipTextActive: {
    color: "#FFFFFF",
  },
  errorText: {
    color: friendsZoneTheme.colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: friendsZoneTheme.colors.secondary,
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
    borderColor: friendsZoneTheme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: friendsZoneTheme.colors.surfaceAlt,
  },
  secondaryButtonText: {
    color: friendsZoneTheme.colors.text,
    fontWeight: "700",
  },
  helperText: {
    color: friendsZoneTheme.colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: friendsZoneTheme.colors.background,
  },
});
