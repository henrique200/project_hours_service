import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Checkbox from "expo-checkbox";
import * as yup from "yup";

import { Labeled } from "./Label";

import {
  A_ABRIU_ESTUDO,
  A_REV_3_ESTUDO,
  A_REV_3_ESTUDO_SF,
  ACTIONS_ALL,
  REVISITA_ACTIONS,
} from "@/constants/noteActions";

import { hhmmToHours, hoursToHHmm } from "@/Functions";
import DatePicker from "./ui/DatePicker";
import { Button, Input } from "./ui";

import { useConfirm } from "@/context/ConfirmProvider";
import { Note, NoteFormProps, Revisita, Estudo } from "@/type";

const HHMM_MSG = "Use o formato HH:mm (ex.: 02:30).";
const HHMM_REGEX = /^(\d{1,2}):([0-5]\d)$/;

function getSchema(isStudy: boolean, revisitaEnabled: boolean) {
  return yup.object({
    dateIso: yup.string().required("Informe a data."),
    hoursHHmm: yup
      .string()
      .required("Informe as horas.")
      .test("hhmm-format", HHMM_MSG, (v) => !!v && HHMM_REGEX.test(v))
      .test(
        "hhmm-range",
        "Valores entre 00:00 e 24:00.",
        (v) => v != null && hhmmToHours(v) !== null
      ),
    locationNotes: yup.string().optional(),

    actions: yup.array(yup.string().required()).ensure().required(),

    revisitaEnabled: yup.boolean().required(),

    nome: yup.string().when([], {
      is: () => revisitaEnabled && !isStudy,
      then: (s) => s.trim().required("Informe o nome do morador."),
      otherwise: (s) => s.optional(),
    }),
    numeroCasa: yup.string().when([], {
      is: () => revisitaEnabled && !isStudy,
      then: (s) => s.trim().required("Informe o nº da casa."),
      otherwise: (s) => s.optional(),
    }),
    dataRevIso: yup.string().when([], {
      is: () => revisitaEnabled && !isStudy,
      then: (s) => s.required("Informe a data combinada."),
      otherwise: (s) => s.optional(),
    }),
    horaRev: yup.string().when([], {
      is: () => revisitaEnabled && !isStudy,
      then: (s) =>
        s
          .required("Informe o horário combinado.")
          .test("hhmm-format", HHMM_MSG, (v) => !!v && HHMM_REGEX.test(v)),
      otherwise: (s) => s.optional(),
    }),
    celular: yup.string().optional(),
    endereco: yup.string().optional(),

    estNome: yup.string().when([], {
      is: () => isStudy,
      then: (s) => s.trim().required("Informe o nome do estudante."),
      otherwise: (s) => s.optional(),
    }),
    estNumeroCasa: yup.string().when([], {
      is: () => isStudy,
      then: (s) => s.trim().required("Informe o nº da casa."),
      otherwise: (s) => s.optional(),
    }),
    estDiaIso: yup.string().when([], {
      is: () => isStudy,
      then: (s) => s.required("Informe o dia do estudo."),
      otherwise: (s) => s.optional(),
    }),
    estHorario: yup.string().when([], {
      is: () => isStudy,
      then: (s) =>
        s
          .required("Informe o horário do estudo.")
          .test("hhmm-format", HHMM_MSG, (v) => !!v && HHMM_REGEX.test(v)),
      otherwise: (s) => s.optional(),
    }),
    estCelular: yup.string().optional(),
    estEndereco: yup.string().optional(),
    estMaterial: yup.string().optional(),
  });
}

type Values = {
  dateIso: string;
  hoursHHmm: string;
  locationNotes: string;
  actions: string[];

  revisitaEnabled: boolean;
  nome: string;
  numeroCasa: string;
  celular: string;
  dataRevIso: string;
  horaRev: string;
  endereco: string;

  estNome: string;
  estNumeroCasa: string;
  estCelular: string;
  estDiaIso: string;
  estHorario: string;
  estEndereco: string;
  estMaterial: string;
};

type Errors = Partial<Record<keyof Values, string>>;

export default function NoteForm({ initial, onSubmit }: NoteFormProps) {
  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const [dateIso, setDateIso] = useState<string>(initial?.date ?? todayIso);
  const [hoursHHmm, setHoursHHmm] = useState(
    initial?.hours !== undefined ? hoursToHHmm(initial?.hours) : ""
  );

  const [locationNotes, setLocationNotes] = useState(
    initial?.locationNotes ?? ""
  );
  const [actions, setActions] = useState<string[]>(initial?.actions ?? []);

  const [revisitaEnabled, setRevisitaEnabled] = useState<boolean>(
    initial?.revisita?.enabled ?? false
  );
  const [nome, setNome] = useState(
    initial?.revisita?.enabled ? initial?.revisita?.nome ?? "" : ""
  );
  const [numeroCasa, setNumeroCasa] = useState(
    initial?.revisita?.enabled ? initial?.revisita?.numeroCasa ?? "" : ""
  );
  const [celular, setCelular] = useState(
    (initial?.revisita?.enabled &&
    initial?.revisita &&
    "celular" in initial.revisita
      ? (initial.revisita as any).celular ?? ""
      : "") as string
  );
  const [dataRevIso, setDataRevIso] = useState<string>(
    (initial?.revisita?.enabled && initial?.revisita?.data) ||
      initial?.date ||
      todayIso
  );
  const [horaRev, setHoraRev] = useState(
    initial?.revisita?.enabled ? initial?.revisita?.horario ?? "" : ""
  );
  const [endereco, setEndereco] = useState(
    (initial?.revisita?.enabled &&
    initial?.revisita &&
    "endereco" in initial.revisita
      ? (initial.revisita as any).endereco ?? ""
      : "") as string
  );

  const initialEstudo =
    initial?.estudo && initial.estudo.enabled ? initial.estudo : undefined;
  const [estNome, setEstNome] = useState(initialEstudo?.nome ?? "");
  const [estNumeroCasa, setEstNumeroCasa] = useState(
    initialEstudo?.numeroCasa ?? ""
  );
  const [estCelular, setEstCelular] = useState(initialEstudo?.celular ?? "");
  const [estDiaIso, setEstDiaIso] = useState<string>(
    initialEstudo?.dia ?? todayIso
  );
  const [estHorario, setEstHorario] = useState(initialEstudo?.horario ?? "");
  const [estEndereco, setEstEndereco] = useState(initialEstudo?.endereco ?? "");
  const [estMaterial, setEstMaterial] = useState(initialEstudo?.material ?? "");

  const confirm = useConfirm();

  const autoStudyByThirdRef = useRef(false);

  const thirdSelected =
    actions.includes(A_REV_3_ESTUDO) || actions.includes(A_REV_3_ESTUDO_SF);

  const explicitStudySelected = actions.includes(A_ABRIU_ESTUDO);
  const initialWasStudy = !!initialEstudo?.enabled;

  const isStudy = thirdSelected || explicitStudySelected || initialWasStudy;

  useEffect(() => {
    const hasRevisita = actions.some((a) => REVISITA_ACTIONS.has(a));
    if (hasRevisita && !revisitaEnabled) setRevisitaEnabled(true);
  }, [actions, revisitaEnabled]);

  useEffect(() => {
    if (explicitStudySelected && !revisitaEnabled) {
      setRevisitaEnabled(true);
    }
  }, [explicitStudySelected, revisitaEnabled]);

  useEffect(() => {
    if (thirdSelected) {
      if (!actions.includes(A_ABRIU_ESTUDO)) {
        autoStudyByThirdRef.current = true;
        setActions((prev) => [...prev, A_ABRIU_ESTUDO]);
      }
    } else {
      if (autoStudyByThirdRef.current && actions.includes(A_ABRIU_ESTUDO)) {
        autoStudyByThirdRef.current = false;
        setActions((prev) => prev.filter((a) => a !== A_ABRIU_ESTUDO));
      } else {
        autoStudyByThirdRef.current = false;
      }
    }
  }, [thirdSelected, actions]);

  function toggleAction(label: string) {
    setActions((prev) => {
      const exists = prev.includes(label);

      if (!exists && label === A_ABRIU_ESTUDO) {
        autoStudyByThirdRef.current = false;
      }
      return exists ? prev.filter((a) => a !== label) : [...prev, label];
    });
  }

  const [touched, setTouched] = useState<
    Partial<Record<keyof Values, boolean>>
  >({});
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const values: Values = {
    dateIso,
    hoursHHmm,
    locationNotes,
    actions,

    revisitaEnabled,
    nome,
    numeroCasa,
    celular,
    dataRevIso,
    horaRev,
    endereco,

    estNome,
    estNumeroCasa,
    estCelular,
    estDiaIso,
    estHorario,
    estEndereco,
    estMaterial,
  };

  function schema() {
    return getSchema(isStudy, revisitaEnabled);
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
      await schema().validateAt(name as string, { ...values, [name]: val });
      setErrors((e) => ({ ...e, [name]: undefined }));
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors((e) => ({ ...e, [name]: err.message }));
      }
    }
  }

  async function handleSave() {
    setFormError(null);
    try {
      const parsed = await schema().validate(values, { abortEarly: false });
      setErrors({});

      const hoursNumber = hhmmToHours(parsed.hoursHHmm)!;

      const revisita: Revisita =
        !isStudy && parsed.revisitaEnabled
          ? {
              enabled: true,
              nome: parsed.nome!.trim(),
              numeroCasa: parsed.numeroCasa!.trim(),
              data: parsed.dataRevIso!,
              horario: parsed.horaRev!.trim(),
              ...(parsed.celular?.trim()
                ? { celular: parsed.celular.trim() }
                : {}),
              ...(parsed.endereco?.trim()
                ? { endereco: parsed.endereco.trim() }
                : {}),
            }
          : { enabled: false };

      const estudo: Estudo = isStudy
        ? {
            enabled: true,
            nome: parsed.estNome!.trim(),
            numeroCasa: parsed.estNumeroCasa!.trim(),
            dia: parsed.estDiaIso!,
            horario: parsed.estHorario!.trim(),
            ...(parsed.estCelular?.trim()
              ? { celular: parsed.estCelular.trim() }
              : {}),
            ...(parsed.estEndereco?.trim()
              ? { endereco: parsed.estEndereco.trim() }
              : {}),
            ...(parsed.estMaterial?.trim()
              ? { material: parsed.estMaterial.trim() }
              : {}),
          }
        : { enabled: false };

      const built: Note = {
        id: initial?.id ?? String(Date.now()),
        date: parsed.dateIso,
        hours: hoursNumber,
        actions: parsed.actions,
        ...(parsed.locationNotes?.trim()
          ? { locationNotes: parsed.locationNotes.trim() }
          : {}),
        revisita,
        estudo,
      };

      onSubmit(built);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(toErrorMap(err));
        setTouched((t) => ({
          ...t,
          dateIso: true,
          hoursHHmm: true,
          nome: true,
          numeroCasa: true,
          dataRevIso: true,
          horaRev: true,
          estNome: true,
          estNumeroCasa: true,
          estDiaIso: true,
          estHorario: true,
        }));
        setFormError("Corrija os campos destacados.");
        return;
      }
      setFormError("Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView className="pb-8" showsVerticalScrollIndicator={false}>
          <View className="gap-y-[14px] p-1">
            {formError ? (
              <View className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <Text className="text-black">{formError}</Text>
              </View>
            ) : null}

            <Labeled label="Data (dd/MM/yyyy)">
              <DatePicker
                value={dateIso}
                onChange={(v) => {
                  if (!touched.dateIso)
                    setTouched((t) => ({ ...t, dateIso: true }));
                  setDateIso(v);
                  validateField("dateIso", v);
                }}
              />
            </Labeled>
            {touched.dateIso && errors.dateIso ? (
              <Text className="text-red-600 mt-1 text-xs">
                {errors.dateIso}
              </Text>
            ) : null}

            <Labeled label="Horas trabalhadas (HH:mm)">
              <Input
                value={hoursHHmm}
                onChangeText={(t) => setHoursHHmm(t)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, hoursHHmm: true }));
                  validateField("hoursHHmm", hoursHHmm);
                }}
                placeholder="Ex: hh:mm(horas e minutos: dois digitos cada)"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                returnKeyType="next"
                error={touched.hoursHHmm ? errors.hoursHHmm : undefined}
              />
            </Labeled>

            <Labeled label="Observações do local (opcional)">
              <Input
                value={locationNotes}
                onChangeText={setLocationNotes}
                placeholder="Ex.: casa azul, portão fechado"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="default"
              />
            </Labeled>

            <Text className="text-base font-semibold">Ações realizadas</Text>
            <View className="gap-[10px]">
              {ACTIONS_ALL.map((label, index) => (
                <TouchableOpacity
                  className="flex-row items-center gap-2"
                  key={index}
                  onPress={() => toggleAction(label)}
                >
                  <Checkbox
                    value={actions.includes(label)}
                    onValueChange={() => toggleAction(label)}
                  />
                  <Text className="flex-1">{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="font-semibold text-base mt-2">
              Marcou alguma revisita?
            </Text>
            <View className="flex-row items-center gap-x-3">
              <TouchableOpacity
                onPress={() => setRevisitaEnabled(!revisitaEnabled)}
                className="flex-row items-center gap-x-2"
                disabled={isStudy}
              >
                <Checkbox
                  value={isStudy ? true : revisitaEnabled}
                  onValueChange={setRevisitaEnabled}
                />
                <Text>{isStudy ? "Sim (virou Estudo)" : "Sim"}</Text>
              </TouchableOpacity>
              {!isStudy && !revisitaEnabled && <Text>Não</Text>}
            </View>

            {(revisitaEnabled || isStudy) && (
              <View className="gap-y-[10px] p-[10px] border border-[#ddd] rounded-lg">
                <Text className="font-semibold text-base mb-1">
                  {isStudy ? "Dados do Estudo" : "Dados da Revisita"}
                </Text>

                <Labeled
                  label={`${
                    isStudy ? "Nome do estudante *" : "Nome do morador *"
                  }`}
                >
                  <Input
                    value={isStudy ? estNome : nome}
                    onChangeText={isStudy ? setEstNome : setNome}
                    onBlur={() => {
                      const key = isStudy ? "estNome" : "nome";
                      setTouched((tt) => ({ ...tt, [key]: true }));
                      validateField(key, (values as any)[key]);
                    }}
                    returnKeyType="next"
                    error={
                      (isStudy ? touched.estNome : touched.nome)
                        ? isStudy
                          ? errors.estNome
                          : errors.nome
                        : undefined
                    }
                  />
                </Labeled>

                <Labeled label="Número da casa *">
                  <Input
                    value={isStudy ? estNumeroCasa : numeroCasa}
                    onChangeText={isStudy ? setEstNumeroCasa : setNumeroCasa}
                    onBlur={() => {
                      const key = isStudy ? "estNumeroCasa" : "numeroCasa";
                      setTouched((tt) => ({ ...tt, [key]: true }));
                      validateField(key, (values as any)[key]);
                    }}
                    inputMode="numeric"
                    returnKeyType="next"
                    error={
                      (isStudy ? touched.estNumeroCasa : touched.numeroCasa)
                        ? isStudy
                          ? errors.estNumeroCasa
                          : errors.numeroCasa
                        : undefined
                    }
                  />
                </Labeled>

                <Labeled
                  label={`${
                    isStudy ? "Celular do estudante" : "Celular (opcional)"
                  }`}
                >
                  <Input
                    value={isStudy ? estCelular : celular}
                    onChangeText={isStudy ? setEstCelular : setCelular}
                    inputMode="tel"
                    returnKeyType="next"
                  />
                </Labeled>

                <Labeled
                  label={`${
                    isStudy
                      ? "Dia do estudo * (dd/MM/yyyy)"
                      : "Data combinada * (dd/MM/yyyy)"
                  }`}
                >
                  <DatePicker
                    value={isStudy ? estDiaIso : dataRevIso}
                    onChange={(v) => {
                      const key = isStudy ? "estDiaIso" : "dataRevIso";
                      if (!touched[key])
                        setTouched((tt) => ({ ...tt, [key]: true }));
                      if (isStudy) setEstDiaIso(v);
                      else setDataRevIso(v);
                      validateField(key, v);
                    }}
                  />
                </Labeled>
                {(isStudy ? touched.estDiaIso : touched.dataRevIso) &&
                (isStudy ? errors.estDiaIso : errors.dataRevIso) ? (
                  <Text className="text-red-600 mt-1 text-xs">
                    {(isStudy ? errors.estDiaIso : errors.dataRevIso) as string}
                  </Text>
                ) : null}

                <Labeled
                  label={`${
                    isStudy
                      ? "Horário do estudo * (HH:mm)"
                      : "Horário combinado * (HH:mm)"
                  }`}
                >
                  <Input
                    value={isStudy ? estHorario : horaRev}
                    onChangeText={isStudy ? setEstHorario : setHoraRev}
                    onBlur={() => {
                      const key = isStudy ? "estHorario" : "horaRev";
                      setTouched((tt) => ({ ...tt, [key]: true }));
                      validateField(key, (values as any)[key]);
                    }}
                    placeholder="14:30"
                    keyboardType="numbers-and-punctuation"
                    autoCapitalize="none"
                    returnKeyType="next"
                    error={
                      (isStudy ? touched.estHorario : touched.horaRev)
                        ? isStudy
                          ? errors.estHorario
                          : errors.horaRev
                        : undefined
                    }
                  />
                </Labeled>

                <Labeled label="Endereço (opcional)">
                  <Input
                    value={isStudy ? estEndereco : endereco}
                    onChangeText={isStudy ? setEstEndereco : setEndereco}
                    placeholder="Rua, nº, bairro..."
                    returnKeyType="next"
                  />
                </Labeled>

                {isStudy && (
                  <Labeled label='Material do estudo (opcional) — ex.: "Seja Feliz para Sempre"'>
                    <Input
                      value={estMaterial}
                      onChangeText={setEstMaterial}
                      placeholder="Publicação/material"
                      returnKeyType="done"
                    />
                  </Labeled>
                )}
              </View>
            )}

            <Button title="Salvar" variant="primary" onPress={handleSave} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
