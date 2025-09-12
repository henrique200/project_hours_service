import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notes/new" options={{ title: "Nova anotação" }} />
      <Stack.Screen name="notes/[id]" options={{ title: "Editar anotação" }} />
      <Stack.Screen name="settings/delete-account" options={{ title: "Apagar Conta" }} />
    </Stack>
  );
}
