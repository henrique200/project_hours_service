import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user } = useAuth();
  return user ? <Redirect href="/(app)/(tabs)/notes" /> : <Redirect href="/(auth)/login" />;
}
