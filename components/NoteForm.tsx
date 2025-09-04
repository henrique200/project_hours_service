import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Note } from "../context/NotesContext";

const ACTIONS = [
  "Entregou publicações em mãos para o morador",
  "Deixou carta na caixinha da casa do morador",
  "Deixou publicação na casa do morador porém não falou com ele (Caixinha)",
];

export type NoteFormProps = {
  initial?: Partial<Note>;
  onSubmit: (note: Note) => void;
};

export default function NoteForm({ initial, onSubmit }: NoteFormProps) {
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [hours, setHours] = useState(String(initial?.hours ?? ""));
  const [locationNotes, setLocationNotes] = useState(
    initial?.locationNotes ?? ""
  );
  const [actions, setActions] = useState<string[]>(initial?.actions ?? []);
  const [revisitaEnabled, setRevisitaEnabled] = useState(
    initial?.revisita?.enabled ?? false
  );
  const [nome, setNome] = useState(initial?.revisita?.nome ?? "");
  const [numeroCasa, setNumeroCasa] = useState(
    initial?.revisita?.numeroCasa ?? ""
  );
  const [celular, setCelular] = useState(initial?.revisita?.celular ?? "");
  const [dataRev, setDataRev] = useState(initial?.revisita?.data ?? date);
  const [horaRev, setHoraRev] = useState(initial?.revisita?.horario ?? "");

  function toggleAction(label: string) {
    setActions((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  }

  function validate() {
    const h = Number(hours);
    if (Number.isNaN(h) || h < 0 || h > 24) {
      Alert.alert(
        "Horas inválidas",
        "As horas devem ser um número entre 0 e 24."
      );
      return false;
    }
    if (revisitaEnabled) {
      if (
        !nome.trim() ||
        !numeroCasa.trim() ||
        !dataRev.trim() ||
        !horaRev.trim()
      ) {
        Alert.alert(
          "Revisita",
          "Quando marcar 'Sim', nome, nº da casa, data e horário são obrigatórios."
        );
        return false;
      }
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    const built: Note = {
      id: initial?.id ?? String(Date.now()),
      date,
      hours: Number(hours),
      locationNotes: locationNotes.trim() || undefined,
      actions,
      revisita: revisitaEnabled
        ? {
            enabled: true,
            nome: nome.trim(),
            numeroCasa: numeroCasa.trim(),
            celular: celular.trim() || undefined,
            data: dataRev,
            horario: horaRev,
          }
        : { enabled: false },
    };
    onSubmit(built);
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ gap: 14 }}>
        <Labeled label="Data (yyyy-mm-dd)">
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2025-09-03"
            style={styles.inputStyle}
            inputMode="text"
          />
        </Labeled>

        <Labeled label="Horas trabalhadas (0–24)">
          <TextInput
            value={hours}
            onChangeText={setHours}
            placeholder="Ex.: 3.5"
            style={styles.inputStyle}
            keyboardType="decimal-pad"
          />
        </Labeled>

        <Labeled label="Observações do local (opcional)">
          <TextInput
            value={locationNotes}
            onChangeText={setLocationNotes}
            placeholder="Ex.: casa azul, portão fechado"
            style={[styles.inputStyle, { minHeight: 64 }]}
            multiline
          />
        </Labeled>

        <Text style={{ fontWeight: "600", fontSize: 16 }}>
          Ações realizadas
        </Text>
        <View style={{ gap: 10 }}>
          {ACTIONS.map((label) => (
            <Pressable
              key={label}
              onPress={() => toggleAction(label)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Checkbox
                value={actions.includes(label)}
                onValueChange={() => toggleAction(label)}
              />
              <Text style={{ flex: 1 }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ fontWeight: "600", fontSize: 16, marginTop: 8 }}>
          Marcou alguma revisita?
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => setRevisitaEnabled(!revisitaEnabled)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
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
          <View
            style={{
              gap: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
            }}
          >
            <Labeled label="Nome do morador *">
              <TextInput
                value={nome}
                onChangeText={setNome}
                style={styles.inputStyle}
              />
            </Labeled>
            <Labeled label="Número da casa *">
              <TextInput
                value={numeroCasa}
                onChangeText={setNumeroCasa}
                style={styles.inputStyle}
                inputMode="numeric"
              />
            </Labeled>
            <Labeled label="Celular (opcional)">
              <TextInput
                value={celular}
                onChangeText={setCelular}
                style={styles.inputStyle}
                inputMode="tel"
              />
            </Labeled>
            <Labeled label="Data combinada * (yyyy-mm-dd)">
              <TextInput
                value={dataRev}
                onChangeText={setDataRev}
                style={styles.inputStyle}
              />
            </Labeled>
            <Labeled label="Horário combinado * (HH:mm)">
              <TextInput
                value={horaRev}
                onChangeText={setHoraRev}
                style={styles.inputStyle}
                placeholder="14:30"
              />
            </Labeled>
          </View>
        )}

        <Pressable onPress={handleSave} style={styles.buttonPrimary}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Salvar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "500" }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  inputStyle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonPrimary: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
