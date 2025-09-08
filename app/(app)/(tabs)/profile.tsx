import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";

export default function Profile() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <View className="flex-1 p-4 bg-white gap-2">
      <Text className="text-xl font-extrabold">Meu perfil</Text>
      <Text>Nome: {user.nomeCompleto || "—"}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Nascimento: {user.dataNascimento || "—"}</Text>
      <Text>Congregação: {user.congregacao || "—"}</Text>
      <Text>Cidade/UF: {user.cidade || "—"} / {user.estado || "—"}</Text>

      <Pressable
        onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
        className="mt-4 bg-brand-900 rounded-xl py-3 items-center"
      >
        <Text className="text-white font-semibold">Sair</Text>
      </Pressable>
    </View>
  );
}
