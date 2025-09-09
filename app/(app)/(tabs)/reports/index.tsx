import { View, Text, FlatList, Alert, ActivityIndicator } from "react-native";
import { useReports } from "../../../../context/ReportsContext";
import { formatCreatedAt, hoursToHHmm, toDisplayDate } from "@/Functions";
import { Button } from "@/components/ui";

export default function ReportsScreen() {
  const { reports, deleteReport, loading, error } = useReports();

  async function handleDeleteReport(id: string, periodLabel: string) {
    Alert.alert(
      "Confirmar exclusão",
      `Tem certeza que deseja excluir o relatório de ${periodLabel}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReport(id);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o relatório.");
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
        <Text className="mt-4 text-gray-600">Carregando relatórios...</Text>
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
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ rowGap: 12, paddingVertical: 8 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              Ainda não há relatórios.{'\n'}
              Gere um na tela de Anotações.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="border border-gray-200 rounded-xl p-3 gap-2">
            <View className="flex-row justify-between items-start">
              <Text className="font-extrabold text-lg flex-1">{item.periodLabel}</Text>
              {item.isClosed && (
                <View className="bg-green-100 px-2 py-1 rounded">
                  <Text className="text-green-700 text-xs font-semibold">Finalizado</Text>
                </View>
              )}
            </View>

            {item.entries.length ? (
              <View className="gap-1">
                {item.entries.map((ent, idx) => (
                  <View key={`${item.id}-${ent.date}-${idx}`} className="flex-row justify-between">
                    <Text className="text-gray-700 flex-1">
                      {toDisplayDate(ent.date)} — {hoursToHHmm(ent.hours)}
                    </Text>
                    {ent.revisita && (
                      <Text className="text-blue-600 font-semibold text-sm">• Revisita</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500">Sem anotações neste mês.</Text>
            )}

            <View className="border-t border-gray-200 pt-2 mt-2">
              <Text className="font-semibold text-lg">
                {item.isClosed ? "Total de horas mensais" : "Total de horas"}: {hoursToHHmm(item.totalHours)}
              </Text>
              <Text className="text-gray-500 text-sm">
                Criado em {formatCreatedAt(item.createdAt)}
              </Text>
            </View>

            <View className="flex-row gap-2 mt-2">
              <Button
                title="Excluir"
                variant="destructive"
                className="flex-1"
                onPress={() => handleDeleteReport(item.id, item.periodLabel)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
