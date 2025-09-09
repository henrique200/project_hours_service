import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
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

import { hhmmToHours, hoursToHHmm, toDisplayDate } from "@/Functions";
import DatePicker from "./ui/DatePicker";
import { Button, Input } from "./ui";

export default function NoteForm({ initial, onSubmit }: NoteFormProps) {
  // hoje em ISO
  const todayIso = useMemo(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    return iso;
  }, []);

  const [dateIso, setDateIso] = useState<string>(initial?.date ?? todayIso);
  const [hoursHHmm, setHoursHHmm] = useState(
    initial?.hours !== undefined ? hoursToHHmm(initial?.hours) : ""
  );

  const [locationNotes, setLocationNotes] = useState(initial?.locationNotes ?? "");
  const [actions, setActions] = useState<string[]>(initial?.actions ?? []);

  const [revisitaEnabled, setRevisitaEnabled] = useState<boolean>(initial?.revisita?.enabled ?? false);
  const [nome, setNome] = useState(initial?.revisita?.nome ?? "");
  const [numeroCasa, setNumeroCasa] = useState(initial?.revisita?.numeroCasa ?? "");
  const [celular, setCelular] = useState(initial?.revisita?.celular ?? "");
  const [dataRevIso, setDataRevIso] = useState<string>(
    initial?.revisita?.data ?? initial?.date ?? todayIso
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
      if (label === A_ABRIU_ESTUDO && prev.includes(A_REV_2_SF) && exists) return prev;
      return exists ? prev.filter((a) => a !== label) : [...prev, label];
    });
  }

  function validate() {
    const h = hhmmToHours(hoursHHmm);
    if (h === null) {
      Alert.alert(
        "Horas inválidas",
        "Use o formato HH:mm (ex.: 02:30) e valores entre 00:00 e 24:00."
      );
      return false;
    }

    if (revisitaEnabled) {
      if (!nome.trim() || !numeroCasa.trim() || !dataRevIso || !horaRev.trim()) {
        Alert.alert(
          "Revisita",
          "Quando marcar 'Sim', nome, nº da casa, data e horário (HH:mm) são obrigatórios."
        );
        return false;
      }
      if (!/^(\d{1,2}):([0-5]\d)$/.test(horaRev)) {
        Alert.alert("Revisita", "O horário combinado deve estar no formato HH:mm (ex.: 14:30).");
        return false;
      }
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;

    const hoursNumber = hhmmToHours(hoursHHmm)!;

    const revisita = revisitaEnabled
      ? {
          enabled: true,
          nome: nome.trim(),
          numeroCasa: numeroCasa.trim(),
          ...(celular.trim() ? { celular: celular.trim() } : {}),
          data: dataRevIso,
          horario: horaRev.trim(),
        }
      : { enabled: false };

    const built: Note = {
      id: initial?.id ?? String(Date.now()),
      date: dateIso,
      hours: hoursNumber,
      actions,
      ...(locationNotes.trim() ? { locationNotes: locationNotes.trim() } : {}),
      revisita,
    };

    onSubmit(built);
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity className="flex-row items-center gap-2" key={index} onPress={() => toggleAction(label)}>
              <Checkbox value={actions.includes(label)} onValueChange={() => toggleAction(label)} />
              <Text className="flex-1">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-semibold text-base mt-2">Marcou alguma revisita?</Text>
        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity onPress={() => setRevisitaEnabled(!revisitaEnabled)} className="flex-row items-center gap-x-2">
            <Checkbox value={revisitaEnabled} onValueChange={setRevisitaEnabled} />
            <Text>Sim</Text>
          </TouchableOpacity>
          {!revisitaEnabled && <Text>Não</Text>}
        </View>

        {revisitaEnabled && (
          <View className="gap-y-[10px] p-[10px] border border-[#ddd] rounded-lg">
            <Labeled label="Nome do morador *">
              <Input value={nome} onChangeText={setNome} returnKeyType="next" />
            </Labeled>

            <Labeled label="Número da casa *">
              <Input value={numeroCasa} onChangeText={setNumeroCasa} inputMode="numeric" returnKeyType="next" />
            </Labeled>

            <Labeled label="Celular (opcional)">
              <Input value={celular} onChangeText={setCelular} inputMode="tel" returnKeyType="next" />
            </Labeled>

            <Labeled label="Data combinada * (dd/MM/yyyy)">
              <DatePicker value={dataRevIso} onChange={setDataRevIso} />
            </Labeled>

            <Labeled label="Horário combinado * (HH:mm)">
              <Input
                value={horaRev}
                onChangeText={setHoraRev}
                placeholder="14:30"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                returnKeyType="done"
              />
            </Labeled>
          </View>
        )}

        <Button title="Salvar" variant="primary" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}
