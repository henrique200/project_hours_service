import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { hoursToHHmm, toDisplayDate } from "@/Functions";
import type { Report } from "@/type";

function buildHtml(report: Report, opts?: { author?: string }) {
  const title = `Relatório — ${report.periodLabel}`;
  const created = report.createdAt
    ? new Date(report.createdAt).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const rows = report.entries
    .map((e) => {
      const tags = [
        e.estudo ? "Estudo" : null,
        !e.estudo && e.revisita ? "Revisita" : null,
      ]
        .filter(Boolean)
        .join(" • ");

      return `
        <tr>
          <td>${toDisplayDate(e.date)}</td>
          <td class="right">${hoursToHHmm(e.hours)}</td>
          <td>${tags || ""}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; color: #111; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #666; font-size: 12px; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  th { text-align: left; background: #fafafa; }
  .right { text-align: right; }
  .total { font-weight: 700; font-size: 16px; margin-top: 6px; }
  .badge { display: inline-block; padding: 2px 8px; font-size: 11px; border-radius: 999px; border: 1px solid #d1d5db; color: #374151; }
  .footer { margin-top: 18px; font-size: 11px; color: #666; }
</style>
</head>
<body>
  <h1>${title}</h1>
  <div class="muted">Gerado em ${created}${opts?.author ? ` • ${opts.author}` : ""}</div>

  <div class="card">
    <div><span class="badge">${report.isClosed ? "Mês fechado" : "Em aberto"}</span></div>

    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th class="right">Horas</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="3">Sem anotações neste mês.</td></tr>`}
      </tbody>
    </table>

    <div class="total">Total: ${hoursToHHmm(report.totalHours)}</div>
  </div>

  <div class="footer">Relatório ${report.id}</div>
</body>
</html>`;
}

export async function exportReportToPdf(report: Report, opts?: { author?: string }) {
  const html = buildHtml(report, opts);
  const { uri } = await Print.printToFileAsync({ html });
  const fileName = `relatorio-${report.month}.pdf`;
  const dest = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${fileName}`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  return dest;
}

export async function shareReportPdf(report: Report, opts?: { author?: string }) {
  const pdfUri = await exportReportToPdf(report, opts);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(pdfUri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: `Relatório ${report.periodLabel}`,
    });
  }
  return pdfUri;
}

export async function saveReportPdfToDownloads(report: Report, opts?: { author?: string }) {
  const pdfUri = await exportReportToPdf(report, opts);
  if (Platform.OS !== "android") return pdfUri;

  const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!perm.granted) return pdfUri;

  const fileName = `relatorio-${report.month}.pdf`;
  const base64 = await FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 });
  const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
    perm.directoryUri,
    fileName,
    "application/pdf"
  );
  await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return destUri;
}
