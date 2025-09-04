import { Link, router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    if (!email) return Alert.alert("Informe o email");
    await signIn(email, senha);
    router.replace("/(app)/notes");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 16, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Entrar</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
         autoCapitalize="none"
      />
      <Pressable onPress={handleLogin} style={styles.btn}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Entrar</Text>
      </Pressable>
      <Link href="/signup">Não tem conta? Cadastrar</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  btn: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
