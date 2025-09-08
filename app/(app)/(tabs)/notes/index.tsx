import { Link, router, Href } from "expo-router";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useNotes } from "../../../../context/NotesContext";
import { useReports } from "../../../../context/ReportsContext";
import { hoursToHHmm, toDisplayDate } from "@/Functions";

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

        <Pressable
          onPress={handleGenerateReport}
          className="flex-1 bg-accent-600 rounded-xl py-3 items-center"
        >
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ rowGap: 12, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View className="border border-gray-200 rounded-xl p-3 gap-2">
            <Text className="font-extrabold">
              {toDisplayDate(item.date)} — {hoursToHHmm(item.hours)}
            </Text>

            {item.locationNotes ? (
              <Text className="text-gray-600 text-justify">{item.locationNotes}</Text>
            ) : null}

            {item.actions?.length ? (
              <View className="mt-1">
                <Text className="text-gray-900 font-semibold mb-1">
                  Ações realizadas:
                </Text>
                <View className="gap-1">
                  {item.actions.map((act, idx) => (
                    <Text
                      key={`${item.id}-action-${idx}`}
                      className="text-gray-700 text-justify"
                    >
                      • {act}
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="text-gray-500 text-justify">Sem ações registradas</Text>
            )}

            {item.revisita?.enabled ? (
              <View className="mt-2 gap-1">
                <Text className="text-gray-900 font-semibold">Revisita:</Text>
                <Text className="text-gray-900">
                  Nome do morador:{" "}
                  <Text className="text-gray-600 text-justify">{item.revisita.nome}</Text>
                </Text>
                <Text className="text-gray-900 text-justify">
                  Número da casa:{" "}
                  <Text className="text-gray-600 text-justify">
                    {item.revisita.numeroCasa}
                  </Text>
                </Text>
                <Text className="text-gray-900 text-justify">
                  Data combinada para revisita:{" "}
                  <Text className="text-gray-600 text-justify">
                    {toDisplayDate(item.revisita.data!)}
                  </Text>
                </Text>
                <Text className="text-gray-900 text-justify">
                  Horário para revisita:{" "}
                  <Text className="text-gray-600 text-justify">{item.revisita.horario}</Text>
                </Text>
                {item.revisita.celular ? (
                  <Text className="text-gray-900 text-justify">
                    Telefone do morador:{" "}
                    <Text className="text-gray-600 text-justify">
                      {item.revisita.celular}
                    </Text>
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="text-gray-500">Sem revisita</Text>
            )}

            <View className="flex-row gap-2 mt-2">
              <Link href={`/(app)/notes/${item.id}` as Href} asChild>
                <Pressable className="border border-brand-900 rounded-xl py-2 px-3">
                  <Text className="text-brand-900 font-semibold">Editar</Text>
                </Pressable>
              </Link>
              <Pressable
                onPress={() => deleteNote(item.id)}
                className="border border-red-500 rounded-xl py-2 px-3"
              >
                <Text className="text-red-500 font-extrabold">Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
