import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";

import { Labeled } from "./Label";

import { Note } from "../context/NotesContext";

import {
  A_ABRIU_ESTUDO,
  A_REV_2_SF,
  ACTIONS_ALL,
  NoteFormProps,
  REVISITA_ACTIONS,
} from "@/constants/noteActions";

import {
  hhmmToHours,
  hoursToHHmm,
  toDisplayDate,
  toIsoDate,
} from "@/Functions";

export default function NoteForm({ initial, onSubmit }: NoteFormProps) {
  const todayIso = useMemo(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    return iso;
  }, []);

  const [dateDisplay, setDateDisplay] = useState(
    initial?.date ? toDisplayDate(initial.date) : toDisplayDate(todayIso)
  );
  const [hoursHHmm, setHoursHHmm] = useState(
    initial?.hours !== undefined ? hoursToHHmm(initial.hours) : ""
  );

  const [locationNotes, setLocationNotes] = useState(
    initial?.locationNotes ?? ""
  );
  const [actions, setActions] = useState<string[]>(initial?.actions ?? []);

  const [revisitaEnabled, setRevisitaEnabled] = useState<boolean>(
    initial?.revisita?.enabled ?? false
  );
  const [nome, setNome] = useState(initial?.revisita?.nome ?? "");
  const [numeroCasa, setNumeroCasa] = useState(
    initial?.revisita?.numeroCasa ?? ""
  );
  const [celular, setCelular] = useState(initial?.revisita?.celular ?? "");
  const [dataRevDisplay, setDataRevDisplay] = useState(
    initial?.revisita?.data
      ? toDisplayDate(initial.revisita.data)
      : toDisplayDate(initial?.date ?? todayIso)
  );
  const [horaRev, setHoraRev] = useState(initial?.revisita?.horario ?? "");

  useEffect(() => {
    const hasRevisita = actions.some((a) => REVISITA_ACTIONS.has(a));
    if (hasRevisita && !revisitaEnabled) setRevisitaEnabled(true);
  }, [actions, revisitaEnabled]);

  useEffect(() => {
    if (actions.includes(A_REV_2_SF) && !actions.includes(A_ABRIU_ESTUDO)) {
      setActions((prev) => [...prev, A_ABRIU_ESTUDO]);
    }
  }, [actions]);

  function toggleAction(label: string) {
    setActions((prev) => {
      const exists = prev.includes(label);
      if (label === A_ABRIU_ESTUDO && prev.includes(A_REV_2_SF) && exists) {
        return prev;
      }
      const next = exists ? prev.filter((a) => a !== label) : [...prev, label];
      return next;
    });
  }

  function validate() {
    const iso = toIsoDate(dateDisplay);
    if (!iso) {
      Alert.alert("Data inválida", "Use o formato dd/MM/yyyy.");
      return false;
    }

    const h = hhmmToHours(hoursHHmm);
    if (h === null) {
      Alert.alert(
        "Horas inválidas",
        "Use o formato HH:mm (ex.: 02:30) e valores entre 00:00 e 24:00."
      );
      return false;
    }

    if (revisitaEnabled) {
      const dataRevIso = toIsoDate(dataRevDisplay);
      if (
        !nome.trim() ||
        !numeroCasa.trim() ||
        !dataRevIso ||
        !horaRev.trim()
      ) {
        Alert.alert(
          "Revisita",
          "Quando marcar 'Sim', nome, nº da casa, data (dd/MM/yyyy) e horário (HH:mm) são obrigatórios."
        );
        return false;
      }
      if (!/^(\d{1,2}):([0-5]\d)$/.test(horaRev)) {
        Alert.alert(
          "Revisita",
          "O horário combinado deve estar no formato HH:mm (ex.: 14:30)."
        );
        return false;
      }
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;

    const dateIso = toIsoDate(dateDisplay)!;
    const hoursNumber = hhmmToHours(hoursHHmm)!;

    const built: Note = {
      id: initial?.id ?? String(Date.now()),
      date: dateIso,
      hours: hoursNumber,
      locationNotes: locationNotes.trim() || undefined,
      actions,
      revisita: revisitaEnabled
        ? {
            enabled: true,
            nome: nome.trim(),
            numeroCasa: numeroCasa.trim(),
            celular: celular.trim() || undefined,
            data: toIsoDate(dataRevDisplay)!,
            horario: horaRev.trim(),
          }
        : { enabled: false },
    };

    onSubmit(built);
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-y-[14px] p-1">
        <Labeled label="Data (dd/MM/yyyy)">
          <TextInput
            value={dateDisplay}
            onChangeText={setDateDisplay}
            placeholder="31/12/2025"
            className="border border-[#ccc] rounded-lg px-3 py-[10px]"
            inputMode="text"
          />
        </Labeled>

        <Labeled label="Horas trabalhadas (HH:mm)">
          <TextInput
            value={hoursHHmm}
            onChangeText={setHoursHHmm}
            placeholder="02:30"
            className="border border-[#ccc] rounded-lg px-3 py-[10px]"
            keyboardType="numbers-and-punctuation"
          />
        </Labeled>

        <Labeled label="Observações do local (opcional)">
          <TextInput
            value={locationNotes}
            onChangeText={setLocationNotes}
            placeholder="Ex.: casa azul, portão fechado"
            className="border border-[#ccc] rounded-lg px-3 py-[10px] min-h-16"
            multiline
          />
        </Labeled>

        <Text className="text-base font-semibold">Ações realizadas</Text>
        <View className="gap-[10px]">
          {ACTIONS_ALL.map((label, index) => (
            <Pressable
              className="flex-row items-center gap-2"
              key={index}
              onPress={() => toggleAction(label)}
            >
              <Checkbox
                value={actions.includes(label)}
                onValueChange={() => toggleAction(label)}
              />
              <Text className="flex-1">{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="font-semibold text-base mt-2">
          Marcou alguma revisita?
        </Text>
        <View className="flex-row items-center gap-x-3">
          <Pressable
            onPress={() => setRevisitaEnabled(!revisitaEnabled)}
            className="flex-row items-center gap-x-2"
          >
            <Checkbox
              value={revisitaEnabled}
              onValueChange={setRevisitaEnabled}
            />
            <Text>Sim</Text>
          </Pressable>
          {!revisitaEnabled && <Text>Não</Text>}
        </View>

        {revisitaEnabled && (
          <View className="gap-y-[10px] p-[10px] border border-[#ddd] rounded-lg">
            <Labeled label="Nome do morador *">
              <TextInput
                value={nome}
                onChangeText={setNome}
                className="border border-[#ccc] rounded-lg px-3 py-[10px]"
              />
            </Labeled>
            <Labeled label="Número da casa *">
              <TextInput
                value={numeroCasa}
                onChangeText={setNumeroCasa}
                className="border border-[#ccc] rounded-lg px-3 py-[10px]"
                inputMode="numeric"
              />
            </Labeled>
            <Labeled label="Celular (opcional)">
              <TextInput
                value={celular}
                onChangeText={setCelular}
                className="border border-[#ccc] rounded-lg px-3 py-[10px]"
                inputMode="tel"
              />
            </Labeled>
            <Labeled label="Data combinada * (dd/MM/yyyy)">
              <TextInput
                value={dataRevDisplay}
                onChangeText={setDataRevDisplay}
                placeholder="31/12/2025"
                className="border border-[#ccc] rounded-lg px-3 py-[10px]"
              />
            </Labeled>
            <Labeled label="Horário combinado * (HH:mm)">
              <TextInput
                value={horaRev}
                onChangeText={setHoraRev}
                className="border border-[#ccc] rounded-lg px-3 py-[10px]"
                placeholder="14:30"
                keyboardType="numbers-and-punctuation"
              />
            </Labeled>
          </View>
        )}

        <Pressable
          onPress={handleSave}
          className="bg-[#111827] p-[14px] rounded-[10px] items-center"
        >
          <Text className="text-[#FFF] font-semibold">Salvar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
