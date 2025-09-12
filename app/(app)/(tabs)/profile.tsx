import { View, Text } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toDisplayDate } from "@/Functions";
import { Button } from "@/components/ui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [isExiting, setIsExiting] = useState(false);
  if (!user) return null;

  const nascimento = user.dataNascimento
    ? toDisplayDate(user.dataNascimento)
    : "—";

  async function handleLogout() {
    try {
      setIsExiting(true);
      await signOut();
      router.replace("/(auth)/login");
    } finally {
      setIsExiting(false);
    }
  }

   function handleDeleteAccount() {
    router.push('/(app)/settings/delete-account');
  }

  return (
    <View className="flex-1 p-4 gap-2 bg-white">
      <Text className="text-xl font-extrabold">Meu perfil</Text>

      <Text>Nome: {user.nomeCompleto || "—"}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Nascimento: {nascimento}</Text>
      <Text>Congregação: {user.congregacao || "—"}</Text>
      <Text>
        Cidade/UF: {user.cidade || "—"} / {user.estado || "—"}
      </Text>

       <View className="mt-4">
        <Button
          title="Apagar Conta"
          variant="primary"
          onPress={handleDeleteAccount}
          loading={isExiting}
        />
      </View>

      <View className="">
        <Button
          title="Sair"
          variant="destructive"
          onPress={handleLogout}
          loading={isExiting}
        />
      </View>
    </View>
  );
}
