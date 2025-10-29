import { useState, useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as yup from "yup";

import { useAuth } from "@/context/AuthContext";
import { Button, Field, Input } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import KAV from "@/components/ui/KAV";

type Values = {
  senha: string;
  confirmSenha: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const schema = yup.object({
  senha: yup
    .string()
    .trim()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .required("Informe a nova senha."),
  confirmSenha: yup
    .string()
    .trim()
    .oneOf([yup.ref("senha")], "A confirmação não confere com a nova senha.")
    .required("Confirme a nova senha."),
});

export default function ResetPassword() {
  const { oobCode } = useLocalSearchParams<{ oobCode?: string }>();
  const { confirmPasswordReset, loading } = useAuth();
  const confirm = useConfirm();

  const [values, setValues] = useState<Values>({ senha: "", confirmSenha: "" });
  const [touched, setTouched] = useState<
    Partial<Record<keyof Values, boolean>>
  >({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const oobMissingMsg = useMemo(
    () =>
      !oobCode
        ? "Abra esta tela pelo link enviado no seu email para já vir com o código."
        : null,
    [oobCode]
  );

  function handleChange<K extends keyof Values>(name: K, val: Values[K]) {
    setValues((v) => ({ ...v, [name]: val }));
    if (touched[name]) {
      validateField(name, val);
    }
  }

  function toErrorMap(err: yup.ValidationError): Errors {
    const out: Errors = {};
    for (const i of err.inner.length ? err.inner : [err]) {
      if (i.path && !out[i.path as keyof Values]) {
        out[i.path as keyof Values] = i.message;
      }
    }
    return out;
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

    if (!oobCode) {
      setFormError(
        "Código de redefinição ausente. Abra o link do email novamente para continuar."
      );
      setTouched({ senha: true, confirmSenha: true });
      try {
        await schema.validate(values, { abortEarly: false });
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          setErrors(toErrorMap(err));
        }
      }
      return;
    }

    try {
      const parsed = await schema.validate(values, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      await confirmPasswordReset(String(oobCode), parsed.senha);

      await confirm.confirm({
        title: "Senha redefinida",
        message: "Sua senha foi alterada com sucesso. Faça login novamente.",
        confirmText: "Entrar",
        confirmVariant: "primary",
      });
      router.replace("/(auth)/login");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(toErrorMap(err));
        setTouched({ senha: true, confirmSenha: true });
        setFormError("Corrija os campos destacados.");
      } else {
        await confirm.confirm({
          title: "Erro",
          message:
            "Não foi possível redefinir sua senha. O link pode ter expirado. Solicite um novo email.",
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
            Criar nova senha
          </Text>

          <View className="bg-white/10 rounded-xl p-4 gap-4">
            {(oobMissingMsg || formError) && (
              <View className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-100">
                  {formError ? formError : oobMissingMsg}
                </Text>
              </View>
            )}

            <Field label="Nova senha" required labelClassName="text-[#FFF]">
              <Input
                placeholder="Mínimo 6 caracteres"
                secureToggle
                value={values.senha}
                onChangeText={(t) => handleChange("senha", t)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, senha: true }));
                  validateField("senha", values.senha);
                }}
                returnKeyType="next"
                error={touched.senha ? errors.senha : undefined}
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
                value={values.confirmSenha}
                onChangeText={(t) => handleChange("confirmSenha", t)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, confirmSenha: true }));
                  validateField("confirmSenha", values.confirmSenha);
                }}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                error={touched.confirmSenha ? errors.confirmSenha : undefined}
              />
            </Field>

            <Button
              title="Confirmar nova senha"
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
