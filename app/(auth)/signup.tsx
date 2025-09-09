import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "@/components/ui";
import DatePicker from "@/components/ui/DatePicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  const { signUp, loading, firebaseUser } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nome, setNome] = useState("");
  const [congreg, setCongreg] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = useMemo(() => new Date(), []);
  const [nascIso, setNascIso] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace("/(app)/(tabs)/notes");
    }
  }, [loading, firebaseUser]);

  function mapError(e: unknown) {
    const code = e instanceof FirebaseError ? e.code : (e as any)?.code ?? "unknown";
    switch (code) {
      case "auth/email-already-in-use":
        return "Este email já está em uso.";
      case "auth/invalid-email":
        return "Email inválido.";
      case "auth/weak-password":
        return "Senha muito fraca. Use pelo menos 6 caracteres.";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet.";
      case "auth/operation-not-allowed":
        return "Método de login desabilitado no Firebase (habilite Email/Senha).";
      default:
        return "Erro no cadastro. Tente novamente.";
    }
  }

  async function handleSubmit() {
    const emailNorm = email.toLowerCase().trim();

    if (!emailNorm || !senha || !confirm || !nome.trim() || !nascIso || !congreg.trim() || !cidade.trim() || !estado.trim()) {
      return Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
    }
    if (senha !== confirm) {
      return Alert.alert("Erro", "As senhas não conferem.");
    }
    if (senha.length < 6) {
      return Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
    }

    try {
      setIsLoading(true);
      await signUp(emailNorm, senha, {
        nomeCompleto: nome.trim(),
        dataNascimento: nascIso, 
        congregacao: congreg.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
      });
      router.replace("/(app)/(tabs)/notes");
    } catch (err) {
      Alert.alert("Erro no cadastro", mapError(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <ScrollView contentContainerStyle={{ padding: 24, rowGap: 12 }}>
        <Text className="text-white text-2xl font-extrabold mb-2">Cadastro</Text>

        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          returnKeyType="next"
        />

        <Input
          placeholder="Senha (mínimo 6 caracteres)"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          value={senha}
          onChangeText={setSenha}
          editable={!isLoading}
          returnKeyType="next"
        />

        <Input
          placeholder="Confirmar senha"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          value={confirm}
          onChangeText={setConfirm}
          editable={!isLoading}
          returnKeyType="next"
        />

        <Input
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          editable={!isLoading}
          returnKeyType="next"
        />

        <DatePicker
          value={nascIso}
          onChange={setNascIso}
          placeholder="Data de nascimento (dd/MM/yyyy)"
          maximumDate={today}
          className="bg-white"
        />

        <Input
          placeholder="Congregação"
          value={congreg}
          onChangeText={setCongreg}
          editable={!isLoading}
          returnKeyType="next"
        />

        <Input
          placeholder="Cidade"
          value={cidade}
          onChangeText={setCidade}
          editable={!isLoading}
          returnKeyType="next"
        />

        <Input
          placeholder="Estado"
          value={estado}
          onChangeText={setEstado}
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title="Criar conta"
          variant="accent"
          onPress={handleSubmit}
          loading={isLoading}
          className="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
