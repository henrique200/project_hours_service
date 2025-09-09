import { Link, router } from "expo-router";
import { View, Text, FlatList, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";

import { useNotes } from "../../../../context/NotesContext";
import { useReports } from "../../../../context/ReportsContext";
import { useAuth } from "@/context/AuthContext";
import { hoursToHHmm, toDisplayDate } from "@/Functions";
import { Button } from "@/components/ui";

export default function NotesList() {
  const { notes, deleteNote, loading, error } = useNotes();
  const { generateAndSaveCurrentMonth } = useReports();
  const [generatingReport, setGeneratingReport] = useState(false);
  const { user } = useAuth();

  async function handleGenerateReport() {
    if (generatingReport) return;
    try {
      setGeneratingReport(true);
      await generateAndSaveCurrentMonth(notes);
      Alert.alert("Relatório gerado", "O relatório do mês atual foi salvo.");
      router.push("/(app)/(tabs)/reports");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
    } finally {
      setGeneratingReport(false);
    }
  }

  async function handleDeleteNote(id: string) {
    const n = notes.find((x) => x.id === id);
    console.log("UID logado:", user?.id, "userId da nota:", n?.userId, "id:", id);

    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta anotação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNote(id);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a anotação.");
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-gray-600">Carregando anotações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Text className="text-gray-600 text-center">
          Verifique sua conexão com a internet e tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      {/* Ações topo */}
      <View className="flex-row gap-2 mb-2">
        <Link href="/(app)/notes/new" asChild>
          <Button title="Nova anotação" variant="primary" className="flex-1" />
        </Link>

        <Button
          title="Gerar relatório"
          variant="secondary"
          className="flex-1"
          loading={generatingReport}
          disabled={generatingReport}
          onPress={handleGenerateReport}
        />
      </View>

      <View className="items-end">
        <Link href="/(app)/(tabs)/reports" asChild>
          <Button variant="ghost" size="sm" className="px-2 py-1">
            <Text className="text-brand-900 font-semibold">Ver relatórios</Text>
          </Button>
        </Link>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ rowGap: 12, paddingVertical: 8 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Ainda não há anotações.{'\n'}
              Comece adicionando uma nova anotação ou use o cronômetro.
            </Text>
          </View>
        }
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
                <Text className="text-gray-900 font-semibold mb-1">Ações realizadas:</Text>
                <View className="gap-1">
                  {item.actions.map((act, idx) => (
                    <Text key={`${item.id}-action-${idx}`} className="text-gray-700 text-justify">
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
                  Nome do morador: <Text className="text-gray-600 text-justify">{item.revisita.nome}</Text>
                </Text>
                <Text className="text-gray-900 text-justify">
                  Número da casa: <Text className="text-gray-600 text-justify">{item.revisita.numeroCasa}</Text>
                </Text>
                <Text className="text-gray-900 text-justify">
                  Data combinada para revisita:{" "}
                  <Text className="text-gray-600 text-justify">{toDisplayDate(item.revisita.data!)}</Text>
                </Text>
                <Text className="text-gray-900 text-justify">
                  Horário para revisita: <Text className="text-gray-600 text-justify">{item.revisita.horario}</Text>
                </Text>
                {item.revisita.celular ? (
                  <Text className="text-gray-900 text-justify">
                    Telefone do morador: <Text className="text-gray-600 text-justify">{item.revisita.celular}</Text>
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="text-gray-500">Sem revisita</Text>
            )}

            <View className="flex-row gap-2 mt-2">
              <Link href={`/(app)/notes/${item.id}`} asChild>
                <Button title="Editar" variant="outline" className="flex-1" />
              </Link>

              <Button
                title="Excluir"
                variant="destructive"
                className="flex-1"
                onPress={() => handleDeleteNote(item.id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
