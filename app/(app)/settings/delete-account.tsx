import { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Button, Field, Input } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import { router } from "expo-router";
import { FirebaseError } from "firebase/app";
import KAV from "@/components/ui/KAV";

function mapDeleteError(e: unknown) {
  const code = e instanceof FirebaseError ? e.code : (e as any)?.code ?? "unknown";
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Senha incorreta.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/requires-recent-login":
      return "Por segurança, entre novamente e tente excluir a conta.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    default:
      return "Não foi possível excluir sua conta agora.";
  }
}

export default function DeleteAccountScreen() {
  const { user, deleteAccount } = useAuth();
  const confirm = useConfirm();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!password.trim()) {
      await confirm.confirm({
        title: "Informe sua senha",
        message: "Para excluir a conta, digite sua senha.",
        confirmText: "OK",
      });
      return;
    }

    const sure = await confirm.confirm({
      title: "Excluir conta",
      message:
        "Esta ação é permanente. Suas anotações e relatórios serão apagados. Deseja continuar?",
      confirmText: "Excluir",
      confirmVariant: "destructive",
      cancelText: "Cancelar",
    });
    if (!sure) return;

    try {
      setBusy(true);
      await deleteAccount(password);
      await confirm.confirm({
        title: "Conta excluída",
        message: "Sua conta e dados foram removidos com sucesso.",
        confirmText: "OK",
      });
      router.replace("/(auth)/login");
    } catch (e) {
      await confirm.confirm({
        title: "Erro",
        message: mapDeleteError(e),
        confirmText: "OK",
        confirmVariant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KAV>
        <View className="flex-1 p-8 justify-center gap-16">
          <View className="gap-2">
            <Text className="text-2xl font-extrabold text-center">Excluir conta</Text>
            <Text className="text-center text-gray-600">
              Esta ação é irreversível. Sua conta ({user?.email ?? "sem email"}) e todos os dados
              associados serão removidos.
            </Text>
          </View>

          <View className="bg-gray-50 rounded-2xl p-2 gap-4">
            <Field label="Confirme sua senha" required>
              <Input
                placeholder="Sua senha"
                secureToggle
                autoComplete="password"
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                editable={!busy}
                returnKeyType="go"
                onSubmitEditing={handleDelete}
              />
            </Field>

            <Button
              title="Excluir minha conta permanentemente"
              variant="destructive"
              onPress={handleDelete}
              loading={busy}
            />
          </View>
        </View>
      </KAV>
    </SafeAreaView>
  );
}
