import { Link, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { FirebaseError } from "firebase/app";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import KAV from "@/components/ui/KAV";

type LoginValues = { email: string; senha: string };
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Email inválido.")
    .required("Informe o email."),
  senha: yup
    .string()
    .trim()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .required("Informe a senha."),
});

export default function Login() {
  const { signIn, loading, firebaseUser } = useAuth();
  const confirm = useConfirm();

  const [values, setValues] = useState<LoginValues>({ email: "", senha: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginValues, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace("/(app)/(tabs)/notes");
    }
  }, [loading, firebaseUser]);

  function mapError(e: unknown) {
    const code =
      e instanceof FirebaseError ? e.code : (e as any)?.code ?? "unknown";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Credenciais inválidas. Verifique email e senha.";
      case "auth/invalid-email":
        return "Email inválido.";
      case "auth/user-disabled":
        return "Usuário desativado.";
      case "auth/too-many-requests":
        return "Muitas tentativas. Tente novamente mais tarde.";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet.";
      case "auth/operation-not-allowed":
        return "Método de login desabilitado no Firebase (habilite Email/Senha).";
      default:
        return "Erro no login. Tente novamente.";
    }
  }

  function toErrorMap(err: yup.ValidationError): LoginErrors {
    const out: LoginErrors = {};
    for (const i of err.inner.length ? err.inner : [err]) {
      if (i.path && !out[i.path as keyof LoginValues]) {
        out[i.path as keyof LoginValues] = i.message;
      }
    }
    return out;
  }

  async function validateField<K extends keyof LoginValues>(
    name: K,
    val: string
  ) {
    try {
      await loginSchema.validateAt(name, { ...values, [name]: val });
      setErrors((e) => ({ ...e, [name]: undefined }));
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((e) => ({ ...e, [name]: err.message }));
      }
    }
  }

  function handleChange<K extends keyof LoginValues>(name: K, val: string) {
    setValues((v) => ({ ...v, [name]: val }));
    if (touched[name]) {
      validateField(name, val);
    }
  }

  async function handleSubmit() {
    setFormError(null);
    try {
      const parsed = await loginSchema.validate(values, { abortEarly: false });
      setErrors({});
      setIsLoading(true);
      await signIn(parsed.email, parsed.senha);
      router.replace("/(app)/(tabs)/notes");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(toErrorMap(err));
        setTouched({ email: true, senha: true });
        setFormError("Corrija os campos destacados.");
        return;
      }
      const msg = mapError(err);
      await confirm.confirm({
        title: "Erro no login",
        message: msg,
        confirmText: "OK",
        confirmVariant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-800 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-800">
      <KAV>
        <View className="flex-1 p-6 justify-center gap-6">
          <Text className="text-white text-2xl font-extrabold">Entrar</Text>

          <View className="bg-white/10 rounded-xl p-4 gap-4">
            {formError ? (
              <View className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-100">{formError}</Text>
              </View>
            ) : null}

            <Field label="Email" required labelClassName="text-white">
              <Input
                placeholder="seu@email.com"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                value={values.email}
                onChangeText={(t) => handleChange("email", t)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, email: true }));
                  validateField("email", values.email);
                }}
                editable={!isLoading}
                returnKeyType="next"
                error={touched.email ? errors.email : undefined}
              />
            </Field>

            <Field label="Senha" required labelClassName="text-white">
              <Input
                placeholder="Sua senha"
                secureToggle
                autoComplete="password"
                textContentType="password"
                value={values.senha}
                onChangeText={(t) => handleChange("senha", t)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, senha: true }));
                  validateField("senha", values.senha);
                }}
                editable={!isLoading}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                error={touched.senha ? errors.senha : undefined}
              />
            </Field>

            <Button
              title="Entrar"
              onPress={handleSubmit}
              loading={isLoading}
              variant="secondary"
              className="w-full"
            />
          </View>

          <Link href="/(auth)/signup" asChild>
            <Button variant="ghost" size="sm" className="items-center">
              <Text className="text-white/90">
                Não tem conta? <Text className="font-semibold">Cadastrar</Text>
              </Text>
            </Button>
          </Link>

          <Link href="/(auth)/forgot-password" asChild>
            <Button variant="ghost" size="sm" className="items-center">
              <Text className="text-white/90">
                Esqueceu a senha?{" "}
                <Text className="font-semibold">Recuperar</Text>
              </Text>
            </Button>
          </Link>
        </View>
      </KAV>
    </SafeAreaView>
  );
}
