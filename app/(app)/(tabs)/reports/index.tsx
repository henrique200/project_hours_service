import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useReports } from "../../../../context/ReportsContext";
import { formatCreatedAt, hoursToHHmm, toDisplayDate } from "@/Functions";
import { Button } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import { shareReportPdf, saveReportPdfToDownloads } from "@/utils/reportPdf";
import { useAuth } from "@/context/AuthContext";
import { Entypo, FontAwesome } from "@expo/vector-icons";

export default function ReportsScreen() {
  const { reports, deleteReport, loading, error } = useReports();
  const { user } = useAuth();
  const confirm = useConfirm();

  async function handleDeleteReport(id: string, periodLabel: string) {
    const ok = await confirm.confirm({
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir o relatório de ${periodLabel}?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    try {
      await deleteReport(id);
    } catch (err) {
      await confirm.confirm({
        title: "Erro",
        message: "Não foi possível excluir o relatório.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
    }
  }

  async function handleShare(item: any) {
    try {
      await shareReportPdf(item, { author: user?.nomeCompleto || user?.email });
    } catch (e) {
      await confirm.confirm({
        title: "Erro ao compartilhar",
        message: "Não foi possível compartilhar o PDF.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
    }
  }

  async function handleSave(item: any) {
    try {
      await saveReportPdfToDownloads(item, {
        author: user?.nomeCompleto || user?.email,
      });
      await confirm.confirm({
        title: "PDF salvo",
        message: "O arquivo foi salvo na pasta escolhida.",
        confirmText: "OK",
      });
    } catch (e) {
      await confirm.confirm({
        title: "Erro ao salvar PDF",
        message: "Tente compartilhar o PDF ou verifique as permissões.",
        confirmText: "OK",
        confirmVariant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
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
              Ainda não há relatórios.{"\n"}
              Gere um na tela de Anotações.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="border border-gray-200 rounded-xl p-3 gap-2">
            <View className="flex-row justify-between items-start">
              <Text className="font-extrabold text-lg flex-1">
                {item.periodLabel}
              </Text>
              {item.isClosed && (
                <View className="bg-green-100 px-2 py-1 rounded">
                  <Text className="text-green-700 text-xs font-semibold">
                    Finalizado
                  </Text>
                </View>
              )}
            </View>

            {item.entries.length ? (
              <View className="gap-1">
                {item.entries.map((ent: any, idx: number) => {
                  const rv = ent?.revisita;
                  const es = ent?.estudo;

                  const isRevisita = !!(typeof rv === "boolean"
                    ? rv
                    : rv?.enabled);
                  const isEstudo = !!(typeof es === "boolean"
                    ? es
                    : es?.enabled);

                  return (
                    <View
                      key={`${item.id}-${ent.date}-${idx}`}
                      className="flex-row justify-between items-center"
                    >
                      <Text className="text-gray-700 flex-1">
                        {toDisplayDate(ent.date)} — {hoursToHHmm(ent.hours)}
                      </Text>

                      <View className="flex-row items-center gap-2">
                        {isRevisita ? (
                          <Text className="text-blue-600 font-semibold text-xs">
                            • Revisita
                          </Text>
                        ) : null}
                        {isEstudo ? (
                          <Text className="text-violet-700 font-semibold text-xs">
                            • Estudo
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="text-gray-500">Sem anotações neste mês.</Text>
            )}

            <View className="border-t border-gray-200 pt-2 mt-2">
              <Text className="font-semibold text-lg">
                {item.isClosed ? "Total de horas mensais" : "Total de horas"}:{" "}
                {hoursToHHmm(item.totalHours)}
              </Text>
              <Text className="text-gray-500 text-sm">
                Criado em {formatCreatedAt(item.createdAt)}
              </Text>
            </View>

            <View className="flex-row gap-2 mt-2">
              <Button
                icon="share"
                sizeIcon={20}
                variant="secondary"
                onPress={() => handleShare(item)}
              />
              {Platform.OS !== "ios" && (
                <Button
                  icon="save"
                  sizeIcon={20}
                  variant="outline"
                  onPress={() => handleSave(item)}
                />
              )}
              <Button
                icon="delete"
                sizeIcon={20}
                variant="destructive"
                onPress={() => handleDeleteReport(item.id, item.periodLabel)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
