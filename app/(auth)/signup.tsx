import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, ActivityIndicator, View } from "react-native";
import { FirebaseError } from "firebase/app";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "@/components/ui";
import DatePicker from "@/components/ui/DatePicker";
import { useConfirm } from "@/context/ConfirmProvider";
import { KAVScroll } from "@/components/ui/KAV";

type SignupValues = {
  email: string;
  senha: string;
  confirm: string;
  nome: string;
  nascIso?: string;
  congreg: string;
  cidade: string;
  estado: string;
};

type SignupErrors = Partial<Record<keyof SignupValues, string>>;

const signupSchema = yup.object({
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
  confirm: yup
    .string()
    .trim()
    .oneOf([yup.ref("senha")], "As senhas não conferem.")
    .required("Confirme a senha."),
  nome: yup.string().trim().required("Informe o nome completo."),
  nascIso: yup
    .string()
    .required("Informe a data de nascimento.")
    .test("date-valid", "Data inválida.", (v) =>
      v ? !Number.isNaN(new Date(v).getTime()) : false
    )
    .test("date-max-today", "Data deve ser no passado.", (v) => {
      if (!v) return false;
      const d = new Date(v);
      const today = new Date();
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return d <= today;
    }),
  congreg: yup.string().trim().required("Informe a congregação."),
  cidade: yup.string().trim().required("Informe a cidade."),
  estado: yup.string().trim().required("Informe o estado."),
});

type SignupParsed = yup.InferType<typeof signupSchema>;

export default function Signup() {
  const { signUp, loading, firebaseUser } = useAuth();
  const confirmModal = useConfirm();

  const today = useMemo(() => new Date(), []);

  const [values, setValues] = useState<SignupValues>({
    email: "",
    senha: "",
    confirm: "",
    nome: "",
    nascIso: undefined,
    congreg: "",
    cidade: "",
    estado: "",
  });

  const [errors, setErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof SignupValues, boolean>>
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
      case "auth/email-already-in-use":
        return "Este email já está em uso.";
      case "auth/invalid-email":
        return "Email inválido.";
      case "auth/weak-password":
        return "Senha muito fraca. Use pelo menos 6 caracteres.";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet.";
      case "auth/operation-not-allowed":
        return "Método de login desabilitado no Firebase (habilite Email/Senha).";
      default:
        return "Erro no cadastro. Tente novamente.";
    }
  }

  function toErrorMap(err: yup.ValidationError): SignupErrors {
    const out: SignupErrors = {};
    for (const i of err.inner.length ? err.inner : [err]) {
      if (i.path && !out[i.path as keyof SignupValues]) {
        out[i.path as keyof SignupValues] = i.message;
      }
    }
    return out;
  }

  async function validateField<K extends keyof SignupValues>(
    name: K,
    val: SignupValues[K]
  ) {
    try {
      await signupSchema.validateAt(name as string, { ...values, [name]: val });
      setErrors((e) => ({ ...e, [name]: undefined }));
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((e) => ({ ...e, [name]: err.message }));
      }
    }
  }

  function handleChange<K extends keyof SignupValues>(
    name: K,
    val: SignupValues[K]
  ) {
    setValues((v) => ({ ...v, [name]: val }));
    if (touched[name]) {
      validateField(name, val);
      if (name === "senha" && touched.confirm) {
        validateField("confirm", (val as string) ?? "");
      }
    }
  }

  async function handleSubmit() {
    setFormError(null);
    try {
      const parsed: SignupParsed = await signupSchema.validate(values, {
        abortEarly: false,
      });
      setErrors({});
      setIsLoading(true);

      await signUp(parsed.email, parsed.senha, {
        nomeCompleto: parsed.nome.trim(),
        dataNascimento: parsed.nascIso,
        congregacao: parsed.congreg.trim(),
        cidade: parsed.cidade.trim(),
        estado: parsed.estado.trim(),
      });

      router.replace("/(app)/(tabs)/notes");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(toErrorMap(err));
        setTouched({
          email: true,
          senha: true,
          confirm: true,
          nome: true,
          nascIso: true,
          congreg: true,
          cidade: true,
          estado: true,
        });
        setFormError("Corrija os campos destacados.");
        return;
      }
      const msg = mapError(err);
      await confirmModal.confirm({
        title: "Erro no cadastro",
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
      <SafeAreaView className="flex-1 bg-brand-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <KAVScroll contentContainerStyle={{ padding: 24, rowGap: 12 }}>
        <Text className="text-white text-2xl font-extrabold mb-2">
          Cadastro
        </Text>

        {formError ? (
          <View className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-1">
            <Text className="text-red-100">{formError}</Text>
          </View>
        ) : null}

        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
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

        <Input
          placeholder="Senha (mínimo 6 caracteres)"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          value={values.senha}
          onChangeText={(t) => handleChange("senha", t)}
          onBlur={() => {
            setTouched((t) => ({ ...t, senha: true }));
            validateField("senha", values.senha);
          }}
          editable={!isLoading}
          returnKeyType="next"
          error={touched.senha ? errors.senha : undefined}
        />

        <Input
          placeholder="Confirmar senha"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          value={values.confirm}
          onChangeText={(t) => handleChange("confirm", t)}
          onBlur={() => {
            setTouched((t) => ({ ...t, confirm: true }));
            validateField("confirm", values.confirm);
          }}
          editable={!isLoading}
          returnKeyType="next"
          error={touched.confirm ? errors.confirm : undefined}
        />

        <Input
          placeholder="Nome completo"
          value={values.nome}
          onChangeText={(t) => handleChange("nome", t)}
          onBlur={() => {
            setTouched((t) => ({ ...t, nome: true }));
            validateField("nome", values.nome);
          }}
          editable={!isLoading}
          returnKeyType="next"
          error={touched.nome ? errors.nome : undefined}
        />
        <View>
          <DatePicker
            value={values.nascIso}
            onChange={(iso) => {
              if (!touched.nascIso)
                setTouched((t) => ({ ...t, nascIso: true }));
              handleChange("nascIso", iso);
              validateField("nascIso", iso);
            }}
            placeholder="Data de nascimento (dd/MM/yyyy)"
            maximumDate={today}
            className="bg-white"
          />
          {touched.nascIso && errors.nascIso ? (
            <Text className="text-red-600 mt-1 text-xs">{errors.nascIso}</Text>
          ) : null}
        </View>

        <Input
          placeholder="Congregação"
          value={values.congreg}
          onChangeText={(t) => handleChange("congreg", t)}
          onBlur={() => {
            setTouched((t) => ({ ...t, congreg: true }));
            validateField("congreg", values.congreg);
          }}
          editable={!isLoading}
          returnKeyType="next"
          error={touched.congreg ? errors.congreg : undefined}
        />

        <Input
          placeholder="Cidade"
          value={values.cidade}
          onChangeText={(t) => handleChange("cidade", t)}
          onBlur={() => {
            setTouched((t) => ({ ...t, cidade: true }));
            validateField("cidade", values.cidade);
          }}
          editable={!isLoading}
          returnKeyType="next"
          error={touched.cidade ? errors.cidade : undefined}
        />

        <Input
          placeholder="Estado"
          value={values.estado}
          onChangeText={(t) => handleChange("estado", t)}
          onBlur={() => {
            setTouched((t) => ({ ...t, estado: true }));
            validateField("estado", values.estado);
          }}
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          error={touched.estado ? errors.estado : undefined}
        />

        <Button
          title="Criar conta"
          variant="accent"
          onPress={handleSubmit}
          loading={isLoading}
          className="mt-4"
          disabled={isLoading}
        />
      </KAVScroll>
    </SafeAreaView>
  );
}
