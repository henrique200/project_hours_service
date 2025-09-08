import { View, Text, FlatList, Pressable } from "react-native";
import { useReports } from "../../../../context/ReportsContext";
import { hoursToHHmm, toDisplayDate } from "@/Functions";

export default function ReportsScreen() {
  const { reports, deleteReport } = useReports();

  return (
    <View className="flex-1 p-4 bg-white">
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ rowGap: 12, paddingVertical: 8 }}
        ListEmptyComponent={
          <Text className="text-gray-500">
            Ainda não há relatórios. Gere um na tela de Anotações.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="border border-gray-200 rounded-xl p-3 gap-2">
            <Text className="font-extrabold text-lg">{item.periodLabel}</Text>

            {item.entries.length ? (
              <View className="gap-1">
                {item.entries.map((ent, idx) => (
                  <Text key={`${item.id}-${ent.date}-${idx}`} className="text-gray-700">
                    {toDisplayDate(ent.date)} — {hoursToHHmm(ent.hours)} {ent.revisita ? "• Revisita" : ""}
                  </Text>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500">Sem anotações neste mês.</Text>
            )}

            <Text className="mt-1 font-semibold">
              {item.isClosed ? "Total de horas mensais" : "Total de horas"}: {hoursToHHmm(item.totalHours)}
            </Text>

            <View className="flex-row gap-2 mt-2">
              <Pressable
                onPress={() => deleteReport(item.id)}
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
