import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

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

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Email inválido.")
    .required("Informe o email."),
});

type Values = { email: string };
type Errors = Partial<Record<keyof Values, string>>;

export default function ForgotPassword() {
  const { resetPassword, loading } = useAuth();
  const confirm = useConfirm();

  const [values, setValues] = useState<Values>({ email: "" });
  const [touched, setTouched] = useState<
    Partial<Record<keyof Values, boolean>>
  >({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function toErrorMap(err: yup.ValidationError): Errors {
    const out: Errors = {};
    for (const i of err.inner.length ? err.inner : [err]) {
      if (i.path && !out[i.path as keyof Values]) {
        out[i.path as keyof Values] = i.message;
      }
    }
    return out;
  }

  function handleChange<K extends keyof Values>(name: K, val: Values[K]) {
    setValues((v) => ({ ...v, [name]: val }));
    if (touched[name]) validateField(name, val);
  }

  async function validateField<K extends keyof Values>(
    name: K,
    val: Values[K]
  ) {
    try {
      await schema.validateAt(name as string, { ...values, [name]: val });
      setErrors((e) => ({ ...e, [name]: undefined }));
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((e) => ({ ...e, [name]: err.message }));
      }
    }
  }

  async function handleSubmit() {
    setFormError(null);
    try {
      const parsed = await schema.validate(values, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      await resetPassword(parsed.email);

      await confirm.confirm({
        title: "Email enviado",
        message:
          "Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e spam.",
        confirmText: "OK",
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(toErrorMap(err));
        setTouched({ email: true });
        setFormError("Corrija os campos destacados.");
      } else {
        await confirm.confirm({
          title: "Erro",
          message: mapResetError(err),
          confirmText: "OK",
          confirmVariant: "destructive",
        });
      }
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
            {formError ? (
              <View className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-100">{formError}</Text>
              </View>
            ) : null}

            <Field label="Email" required labelClassName="text-[#FFF]">
              <Input
                placeholder="seu@email.com"
                value={values.email}
                onChangeText={(t) => handleChange("email", t)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, email: true }));
                  validateField("email", values.email);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                editable={!submitting}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                error={touched.email ? errors.email : undefined}
              />
            </Field>

            <Button
              title="Enviar link de redefinição"
              onPress={handleSubmit}
              loading={submitting}
              variant="secondary"
              className="w-full"
              disabled={submitting}
            />
          </View>
        </View>
      </KAV>
    </SafeAreaView>
  );
}
