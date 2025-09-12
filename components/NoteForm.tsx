import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";

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
import { Note, NoteFormProps } from "@/type";
import KAV, { KAVScroll } from "./ui/KAV";

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

  // revisita (quando NÃO for estudo)
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

  // estudo
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

  // flag: "Abriu estudo" marcado automaticamente devido à 3ª revisita
  const autoStudyByThirdRef = useRef(false);

  // estados derivados
  const thirdSelected =
    actions.includes(A_REV_3_ESTUDO) || actions.includes(A_REV_3_ESTUDO_SF);

  const explicitStudySelected = actions.includes(A_ABRIU_ESTUDO);
  const initialWasStudy = !!initialEstudo?.enabled;

  // Agora o formulário vira Estudo também quando "Abriu estudo" for marcado manualmente
  const isStudy = thirdSelected || explicitStudySelected || initialWasStudy;

  // 1) Qualquer ação de revisita => liga a seção (se isStudy, a UI mostra Estudo)
  useEffect(() => {
    const hasRevisita = actions.some((a) => REVISITA_ACTIONS.has(a));
    if (hasRevisita && !revisitaEnabled) setRevisitaEnabled(true);
  }, [actions, revisitaEnabled]);

  // 1.1) Se marcar explicitamente "Abriu estudo", garante abrir a seção
  useEffect(() => {
    if (explicitStudySelected && !revisitaEnabled) {
      setRevisitaEnabled(true);
    }
  }, [explicitStudySelected, revisitaEnabled]);

  // 2) Regra simétrica para 3ª revisita (auto marca e remove "Abriu estudo")
  useEffect(() => {
    if (thirdSelected) {
      if (!actions.includes(A_ABRIU_ESTUDO)) {
        autoStudyByThirdRef.current = true; // marcado automaticamente por 3ª revisita
        setActions((prev) => [...prev, A_ABRIU_ESTUDO]);
      }
    } else {
      // só remove automaticamente se foi adicionado automaticamente
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

      // Se o usuário marcar manualmente "Abriu estudo", desligamos a flag de auto
      if (!exists && label === A_ABRIU_ESTUDO) {
        autoStudyByThirdRef.current = false;
      }
      return exists ? prev.filter((a) => a !== label) : [...prev, label];
    });
  }

  // validação comum (formato de horas)
  async function validate(): Promise<boolean> {
    const h = hhmmToHours(hoursHHmm);
    if (h === null) {
      await confirm.confirm({
        title: "Horas inválidas",
        message:
          "Use o formato HH:mm (ex.: 02:30) e valores entre 00:00 e 24:00.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
      return false;
    }

    // Seção ativa (revisita ou estudo)
    if (revisitaEnabled || isStudy) {
      if (isStudy) {
        // Validação do ESTUDO
        if (
          !estNome.trim() ||
          !estNumeroCasa.trim() ||
          !estDiaIso ||
          !estHorario.trim()
        ) {
          await confirm.confirm({
            title: "Estudo",
            message:
              "Nome, nº da casa, dia e horário (HH:mm) são obrigatórios.",
            confirmText: "OK",
          });
          return false;
        }
        if (!/^(\d{1,2}):([0-5]\d)$/.test(estHorario)) {
          await confirm.confirm({
            title: "Estudo",
            message:
              "O horário do estudo deve estar no formato HH:mm (ex.: 14:30).",
            confirmText: "OK",
          });
          return false;
        }
      } else {
        // Validação da REVISITA
        if (
          !nome.trim() ||
          !numeroCasa.trim() ||
          !dataRevIso ||
          !horaRev.trim()
        ) {
          await confirm.confirm({
            title: "Revisita",
            message:
              "Quando marcar 'Sim', nome, nº da casa, data e horário (HH:mm) são obrigatórios.",
            confirmText: "OK",
          });
          return false;
        }
        if (!/^(\d{1,2}):([0-5]\d)$/.test(horaRev)) {
          await confirm.confirm({
            title: "Revisita",
            message:
              "O horário combinado deve estar no formato HH:mm (ex.: 14:30).",
            confirmText: "OK",
          });
          return false;
        }
      }
    }

    return true;
  }

  async function handleSave() {
    const isValid = await validate();
    if (!isValid) return;

    const hoursNumber = hhmmToHours(hoursHHmm)!;

    // Montagem condicionada
    const revisita =
      !isStudy && revisitaEnabled
        ? {
            enabled: true as const,
            nome: nome.trim(),
            numeroCasa: numeroCasa.trim(),
            ...(celular.trim() ? { celular: celular.trim() } : {}),
            data: dataRevIso,
            horario: horaRev.trim(),
            ...(endereco.trim() ? { endereco: endereco.trim() } : {}),
          }
        : { enabled: false as const };

    const estudo = isStudy
      ? {
          enabled: true as const,
          nome: estNome.trim(),
          numeroCasa: estNumeroCasa.trim(),
          ...(estCelular.trim() ? { celular: estCelular.trim() } : {}),
          dia: estDiaIso,
          horario: estHorario.trim(),
          ...(estEndereco.trim() ? { endereco: estEndereco.trim() } : {}),
          ...(estMaterial.trim() ? { material: estMaterial.trim() } : {}),
        }
      : { enabled: false as const };

    const built: Note = {
      id: initial?.id ?? String(Date.now()),
      date: dateIso,
      hours: hoursNumber,
      actions,
      ...(locationNotes.trim() ? { locationNotes: locationNotes.trim() } : {}),
      revisita,
      estudo,
    };

    onSubmit(built);
  }

  return (
    <KAVScroll contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="gap-y-[14px] p-1">
        <Labeled label="Data (dd/MM/yyyy)">
          <DatePicker value={dateIso} onChange={setDateIso} />
        </Labeled>

        <Labeled label="Horas trabalhadas (HH:mm)">
          <Input
            value={hoursHHmm}
            onChangeText={setHoursHHmm}
            placeholder="02:30"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            returnKeyType="next"
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
            disabled={isStudy} // se virou estudo (3ª revisita ou abriu estudo), desabilito o toggle
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

            {/* Nome */}
            <Labeled
              label={`${isStudy ? "Nome do estudante *" : "Nome do morador *"}`}
            >
              <Input
                value={isStudy ? estNome : nome}
                onChangeText={isStudy ? setEstNome : setNome}
                returnKeyType="next"
              />
            </Labeled>

            {/* Número da casa */}
            <Labeled label="Número da casa *">
              <Input
                value={isStudy ? estNumeroCasa : numeroCasa}
                onChangeText={isStudy ? setEstNumeroCasa : setNumeroCasa}
                inputMode="numeric"
                returnKeyType="next"
              />
            </Labeled>

            {/* Celular (opcional) */}
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

            {/* Data/Dia */}
            <Labeled
              label={`${
                isStudy
                  ? "Dia do estudo * (dd/MM/yyyy)"
                  : "Data combinada * (dd/MM/yyyy)"
              }`}
            >
              <DatePicker
                value={isStudy ? estDiaIso : dataRevIso}
                onChange={isStudy ? setEstDiaIso : setDataRevIso}
              />
            </Labeled>

            {/* Horário */}
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
                placeholder="14:30"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </Labeled>

            {/* Endereço (opcional) */}
            <Labeled label="Endereço (opcional)">
              <Input
                value={isStudy ? estEndereco : endereco}
                onChangeText={isStudy ? setEstEndereco : setEndereco}
                placeholder="Rua, nº, bairro..."
                returnKeyType="next"
              />
            </Labeled>

            {/* Material (opcional) - só em estudo */}
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
    </KAVScroll>
  );
}
