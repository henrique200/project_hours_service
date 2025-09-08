import { Link, router, Href } from "expo-router";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useNotes } from "../../../../context/NotesContext";
import { useReports } from "../../../../context/ReportsContext";

export default function NotesList() {
  const { notes, deleteNote } = useNotes();
  const { generateAndSaveCurrentMonth } = useReports();

  async function handleGenerateReport() {
    try {
      await generateAndSaveCurrentMonth(notes);
      Alert.alert("Relatório gerado", "O relatório do mês atual foi salvo.");
      router.push("/(app)/(tabs)/reports" as Href);
    } catch {
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
    }
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row gap-2 mb-2">
        <Link href={"/(app)/notes/new" as Href} asChild>
          <Pressable className="flex-1 bg-brand-900 rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">Nova anotação</Text>
          </Pressable>
        </Link>

        <Pressable onPress={handleGenerateReport} className="flex-1 bg-accent-600 rounded-xl py-3 items-center">
          <Text className="text-white font-bold">Gerar relatório</Text>
        </Pressable>
      </View>

      <View className="items-end">
        <Link href={"/(app)/(tabs)/reports" as Href} asChild>
          <Pressable className="px-2 py-1">
            <Text className="text-brand-900 font-semibold">Ver relatórios</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ rowGap: 12, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View className="border border-gray-200 rounded-xl p-3 gap-1">
            <Text className="font-extrabold">{item.date} — {item.hours}h</Text>
            {item.locationNotes ? <Text className="text-gray-600">{item.locationNotes}</Text> : null}
            {item.actions?.length ? <Text className="text-gray-700">Ações: {item.actions.join(", ")}</Text> : null}
            {item.revisita?.enabled ? (
              <Text className="text-gray-900">
                Revisita: {item.revisita.nome} • Casa {item.revisita.numeroCasa} • {item.revisita.data} {item.revisita.horario}
                {item.revisita.celular ? ` • ${item.revisita.celular}` : ""}
              </Text>
            ) : <Text className="text-gray-500">Sem revisita</Text>}

            <View className="flex-row gap-2 mt-2">
              <Link href={`/(app)/notes/${item.id}` as Href} asChild>
                <Pressable className="border border-brand-900 rounded-xl py-2 px-3">
                  <Text className="text-brand-900 font-semibold">Editar</Text>
                </Pressable>
              </Link>
              <Pressable onPress={() => deleteNote(item.id)} className="border border-red-500 rounded-xl py-2 px-3">
                <Text className="text-red-500 font-extrabold">Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
