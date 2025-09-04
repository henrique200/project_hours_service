import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";

export default function Profile() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Meu perfil</Text>
      <Text>Nome: {user.nomeCompleto || "—"}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Nascimento: {user.dataNascimento || "—"}</Text>
      <Text>Congregação: {user.congregacao || "—"}</Text>
      <Text>
        Cidade/UF: {user.cidade || "—"} / {user.estado || "—"}
      </Text>

      <Pressable
        onPress={async () => {
          await signOut();
          router.replace("/");
        }}
        style={{
          marginTop: 16,
          backgroundColor: "#111827",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Sair</Text>
      </Pressable>
    </View>
  );
}
