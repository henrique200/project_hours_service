import { Slot, Stack, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/" />;
  return (
    <Stack>
      <Stack.Screen name="notes/index" options={{ title: "Anotações" }} />
      <Stack.Screen name="notes/new" options={{ title: "Nova anotação" }} />
      <Stack.Screen name="notes/[id]" options={{ title: "Editar anotação" }} />
      <Stack.Screen name="profile" options={{ title: "Meu perfil" }} />
      <Stack.Screen name="reports/index" options={{ title: "Relatórios" }} /> 
      <Slot />
    </Stack>
  );
}
