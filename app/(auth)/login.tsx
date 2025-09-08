import { Link, router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, SafeAreaView } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    if (!email) return Alert.alert("Informe o email");
    await signIn(email, senha);
    router.replace("/(app)/(tabs)/notes");
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-800">
      <View className="flex-1 p-6 justify-center gap-6 ">
        <Text className="text-white text-2xl font-extrabold">Entrar</Text>

        <View className="bg-white/10 rounded-xl p-4 gap-3">
          <TextInput
            className="bg-white rounded-xl px-4 py-3"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="bg-white rounded-xl px-4 py-3"
            placeholder="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
          <Pressable onPress={handleLogin} className="bg-accent-600 rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">Entrar</Text>
          </Pressable>
        </View>

        <Link href="/(auth)/signup" asChild>
          <Pressable className="items-center">
            <Text className="text-white/90">
              Não tem conta? <Text className="font-semibold">Cadastrar</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
