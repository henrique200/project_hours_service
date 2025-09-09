import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input } from "@/components/ui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { signIn, loading, firebaseUser } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace("/(app)/(tabs)/notes");
    }
  }, [loading, firebaseUser]);

  function mapError(e: unknown) {
    const code = e instanceof FirebaseError ? e.code : (e as any)?.code ?? "unknown";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Credenciais inválidas. Verifique email e senha.";
      case "auth/invalid-email":
        return "Email inválido.";
      case "auth/user-disabled":
        return "Usuário desativado.";
      case "auth/too-many-requests":
        return "Muitas tentativas. Tente novamente mais tarde.";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet.";
      case "auth/operation-not-allowed":
        return "Método de login desabilitado no Firebase (habilite Email/Senha).";
      default:
        return "Erro no login. Tente novamente.";
    }
  }

  async function handleLogin() {
    const emailNorm = email.toLowerCase().trim();
    if (!emailNorm) return Alert.alert("Erro", "Informe o email");
    if (!senha.trim()) return Alert.alert("Erro", "Informe a senha");
    try {
      setIsLoading(true);
      await signIn(emailNorm, senha);
      router.replace("/(app)/(tabs)/notes");
    } catch (err) {
      Alert.alert("Erro no login", mapError(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-800 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-800">
      <View className="flex-1 p-6 justify-center gap-6">
        <Text className="text-white text-2xl font-extrabold">Entrar</Text>

        <View className="bg-white/10 rounded-xl p-4 gap-4">
          <Field label="Email" required>
            <Input
              placeholder="seu@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              returnKeyType="next"
            />
          </Field>

          <Field label="Senha" required>
            <Input
              placeholder="Sua senha"
              secureToggle
              autoComplete="password"
              textContentType="password"
              value={senha}
              onChangeText={setSenha}
              editable={!isLoading}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </Field>

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={isLoading}
            variant="secondary"
            className="w-full"
          />
        </View>

        <Link href="/(auth)/signup" asChild>
          <Button variant="ghost" size="sm" className="items-center">
            <Text className="text-white/90">
              Não tem conta? <Text className="font-semibold">Cadastrar</Text>
            </Text>
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
