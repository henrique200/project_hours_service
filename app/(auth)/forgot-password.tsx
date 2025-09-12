import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Button, Field, Input } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import { FirebaseError } from "firebase/app";
import KAV from "@/components/ui/KAV";

function mapResetError(e: unknown) {
  const code =
    e instanceof FirebaseError ? e.code : (e as any)?.code ?? "unknown";
  switch (code) {
    case "auth/invalid-email":
      return "Email inválido.";
    case "auth/user-not-found":
      return "Não encontramos uma conta com este email.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    default:
      return "Não foi possível enviar o email de redefinição.";
  }
}

export default function ForgotPassword() {
  const { resetPassword, loading } = useAuth();
  const confirm = useConfirm();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) {
      await confirm.confirm({
        title: "Informe o email",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      await resetPassword(emailNorm);
      await confirm.confirm({
        title: "Email enviado",
        message:
          "Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e spam.",
        confirmText: "OK",
      });
    } catch (e) {
      await confirm.confirm({
        title: "Erro",
        message: mapResetError(e),
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
            Recuperar senha
          </Text>

          <View className="bg-white/10 rounded-xl p-4 gap-4">
            <Field label="Email" required labelClassName="text-[#FFF]">
              <Input
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                editable={!submitting}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
            </Field>

            <Button
              title="Enviar link de redefinição"
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
