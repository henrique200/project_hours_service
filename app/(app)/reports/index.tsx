import { View, Text, FlatList, Pressable } from "react-native";
import { useReports } from "../../../context/ReportsContext";

export default function ReportsScreen() {
  const { reports, deleteReport } = useReports();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
        ListEmptyComponent={
          <Text style={{ color: "#6b7280" }}>
            Ainda não há relatórios. Gere um na tela de Anotações.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>{item.periodLabel}</Text>
            {/* lista condensada com info de revisita */}
            {item.entries.length ? (
              <View style={{ gap: 4 }}>
                {item.entries.map(ent => (
                  <Text key={ent.date} style={{ color: "#374151" }}>
                    {ent.date} — {ent.hours}h {ent.revisita ? "• Revisita" : ""}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={{ color: "#6b7280" }}>Sem anotações neste mês.</Text>
            )}

            <Text style={{ marginTop: 6, fontWeight: "600" }}>
              {item.isClosed ? "Total de horas mensais" : "Total de horas"}: {item.totalHours}h
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={() => deleteReport(item.id)}
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
