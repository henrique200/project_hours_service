import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Button, Field, Input } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import KAV from "@/components/ui/KAV";

export default function ResetPassword() {
  const { oobCode } = useLocalSearchParams<{ oobCode?: string }>();
  const { confirmPasswordReset, loading } = useAuth();
  const confirm = useConfirm();

  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!oobCode) {
      await confirm.confirm({
        title: "Link inválido",
        message:
          "Código de redefinição ausente. Abra o link do email novamente.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
      return;
    }
    if (!senha || !confirmSenha) {
      await confirm.confirm({
        title: "Campos obrigatórios",
        message: "Informe e confirme a nova senha.",
        confirmText: "OK",
      });
      return;
    }
    if (senha !== confirmSenha) {
      await confirm.confirm({
        title: "Senhas diferentes",
        message: "A confirmação não confere com a nova senha.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
      return;
    }
    if (senha.length < 6) {
      await confirm.confirm({
        title: "Senha fraca",
        message: "A senha deve ter pelo menos 6 caracteres.",
        confirmText: "OK",
      });
      return;
    }

    try {
      setSubmitting(true);
      await confirmPasswordReset(String(oobCode), senha);
      await confirm.confirm({
        title: "Senha redefinida",
        message: "Sua senha foi alterada com sucesso. Faça login novamente.",
        confirmText: "Entrar",
        confirmVariant: "primary",
      });
      router.replace("/(auth)/login");
    } catch (e) {
      await confirm.confirm({
        title: "Erro",
        message:
          "Não foi possível redefinir sua senha. O link pode ter expirado. Solicite um novo email.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-800 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-800">
      <KAV>
        <View className="flex-1 p-6 justify-center gap-6">
          <Text className="text-white text-2xl font-extrabold">
            Criar nova senha
          </Text>

          <View className="bg-white/10 rounded-xl p-4 gap-4">
            {!oobCode && (
              <Text className="text-red-200">
                Abra esta tela pelo link enviado no seu email para já vir com o
                código.
              </Text>
            )}

            <Field label="Nova senha" required labelClassName="text-[#FFF]">
              <Input
                placeholder="Mínimo 6 caracteres"
                secureToggle
                value={senha}
                onChangeText={setSenha}
                returnKeyType="next"
              />
            </Field>

            <Field
              label="Confirmar nova senha"
              required
              labelClassName="text-[#FFF]"
            >
              <Input
                placeholder="Repita a senha"
                secureToggle
                value={confirmSenha}
                onChangeText={setConfirmSenha}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
            </Field>

            <Button
              title="Confirmar nova senha"
              onPress={handleSubmit}
              loading={submitting}
              variant="secondary"
              className="w-full"
            />
          </View>
        </View>
      </KAV>
    </SafeAreaView>
  );
}
