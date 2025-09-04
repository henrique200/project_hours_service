import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { saveProfile, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nome, setNome] = useState("");
  const [nasc, setNasc] = useState("");
  const [congreg, setCongreg] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  async function handleSubmit() {
    if (
      !email ||
      !senha ||
      !confirm ||
      !nome ||
      !nasc ||
      !congreg ||
      !cidade ||
      !estado
    )
      return Alert.alert("Preencha todos os campos obrigatórios.");
    if (senha !== confirm) return Alert.alert("As senhas não conferem.");
    await saveProfile({
      email,
      nomeCompleto: nome,
      dataNascimento: nasc,
      congregacao: congreg,
      cidade,
      estado,
    });
    await signIn(email, senha); // não persiste senha
    router.replace("/(app)/notes");
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Cadastro</Text>
      <TextInput
        style={styles.i}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.i}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <TextInput
        style={styles.i}
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
      <TextInput
        style={styles.i}
        placeholder="Data de nascimento (yyyy-mm-dd)"
        value={nasc}
        onChangeText={setNasc}
      />
      <TextInput
        style={styles.i}
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.i}
        placeholder="Congregação"
        value={congreg}
        onChangeText={setCongreg}
      />
      <TextInput
        style={styles.i}
        placeholder="Cidade"
        value={cidade}
        onChangeText={setCidade}
      />
      <TextInput
        style={styles.i}
        placeholder="Estado"
        value={estado}
        onChangeText={setEstado}
      />
      <Pressable onPress={handleSubmit} style={styles.btn}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Criar conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  i: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  btn: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
});
