import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, SafeAreaView } from "react-native";
import { useAuth } from "../../context/AuthContext";

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
    if (!email || !senha || !confirm || !nome || !nasc || !congreg || !cidade || !estado)
      return Alert.alert("Preencha todos os campos obrigatórios.");
    if (senha !== confirm) return Alert.alert("As senhas não conferem.");
    await saveProfile({ email, nomeCompleto: nome, dataNascimento: nasc, congregacao: congreg, cidade, estado });
    await signIn(email, senha);
    router.replace("/(app)/(tabs)/notes");
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <ScrollView contentContainerStyle={{ padding: 24, rowGap: 12 }}>
        <Text className="text-white text-2xl font-extrabold mb-2">Cadastro</Text>

        {[
          { ph: "Email", val: email, set: setEmail, type: "email-address" as const },
          { ph: "Senha", val: senha, set: setSenha, secure: true },
          { ph: "Confirmar senha", val: confirm, set: setConfirm, secure: true },
          { ph: "Data de nascimento (yyyy-mm-dd)", val: nasc, set: setNasc },
          { ph: "Nome completo", val: nome, set: setNome },
          { ph: "Congregação", val: congreg, set: setCongreg },
          { ph: "Cidade", val: cidade, set: setCidade },
          { ph: "Estado", val: estado, set: setEstado },
        ].map((f) => (
          <TextInput
            key={f.ph}
            className="bg-white rounded-xl px-4 py-3"
            placeholder={f.ph}
            value={f.val}
            onChangeText={f.set as any}
            secureTextEntry={f.secure}
            keyboardType={f.type}
          />
        ))}

        <Pressable onPress={handleSubmit} className="bg-accent-600 rounded-xl py-3 items-center">
          <Text className="text-white font-semibold">Criar conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
