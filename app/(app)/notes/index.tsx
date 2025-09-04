import { Link, router, Href, Stack } from "expo-router";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useNotes } from "../../../context/NotesContext";
import { useReports } from "../../../context/ReportsContext";

export default function NotesList() {
  const { notes, deleteNote } = useNotes();
  const { generateAndSaveCurrentMonth } = useReports();

  // 👉 adiciona o botão "Perfil" no header
  const profileHref = "/(app)/profile" as const satisfies Href;

  async function handleGenerateReport() {
    try {
      await generateAndSaveCurrentMonth(notes);
      Alert.alert("Relatório gerado", "O relatório do mês atual foi salvo.");
      router.push("/(app)/reports" as Href);
    } catch {
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Stack.Screen
        options={{
          title: "Anotações",
          headerRight: () => (
            <Link href={profileHref} asChild>
              <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontWeight: "600", color: "#111827" }}>Perfil</Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Link href={"/(app)/notes/new" as Href} asChild>
          <Pressable style={{ backgroundColor: "#111827", padding: 12, borderRadius: 10, alignItems: "center", flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Nova anotação</Text>
          </Pressable>
        </Link>

        <Pressable
          onPress={handleGenerateReport}
          style={{ backgroundColor: "#065f46", padding: 12, borderRadius: 10, alignItems: "center", flex: 1 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Gerar relatório</Text>
        </Pressable>
      </View>

      {/* atalho extra visível na tela */}
      <View style={{ alignItems: "flex-end" }}>
        <Link href={profileHref} asChild>
          <Pressable style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ color: "#111827", fontWeight: "600" }}>Meu perfil</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 6 }}>
            <Text style={{ fontWeight: "700" }}>{item.date} — {item.hours}h</Text>
            {item.locationNotes ? <Text style={{ color: "#4b5563" }}>{item.locationNotes}</Text> : null}
            {item.actions?.length ? <Text style={{ color: "#374151" }}>Ações: {item.actions.join(", ")}</Text> : null}
            {item.revisita?.enabled ? (
              <Text style={{ color: "#111827" }}>
                Revisita: {item.revisita.nome} • Casa {item.revisita.numeroCasa} • {item.revisita.data} {item.revisita.horario}
                {item.revisita.celular ? ` • ${item.revisita.celular}` : ""}
              </Text>
            ) : <Text style={{ color: "#6b7280" }}>Sem revisita</Text>}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Link href={`/(app)/notes/${item.id}` as Href} asChild>
                <Pressable style={{ borderWidth: 1, borderColor: "#111827", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
                  <Text style={{ color: "#111827", fontWeight: "600" }}>Editar</Text>
                </Pressable>
              </Link>
              <Pressable
                onPress={() => deleteNote(item.id)}
                style={{ borderWidth: 1, borderColor: "#ef4444", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
              >
                <Text style={{ color: "#ef4444", fontWeight: "700" }}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
