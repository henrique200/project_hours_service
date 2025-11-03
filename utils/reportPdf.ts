import { printToFileAsync } from "expo-print";
import { isAvailableAsync as sharingAvailable, shareAsync } from "expo-sharing";
import * as FS from "expo-file-system/legacy";
import { Platform } from "react-native";
import { hoursToHHmm } from "@/Functions";
import type { Report } from "@/type";

type ExportOpts = {
  author?: string;
  name?: string;
  includeHours?: boolean;
  notes?: string;
};

function monthNameFromPeriodLabel(periodLabel?: string) {
  if (!periodLabel) return "";
  const m = periodLabel.split("—")[0]?.trim();
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : "";
}

function countEstudos(report: Report) {
  return report.entries.reduce((acc: number, e: any) => {
    const es = e?.estudo;
    const isEstudo = !!(typeof es === "boolean" ? es : es?.enabled);
    return acc + (isEstudo ? 1 : 0);
  }, 0);
}

function checkboxSvg(checked: boolean) {
  return `
  <div class="checkbox">
    <div class="box">${checked ? "✔" : ""}</div>
  </div>`;
}

function buildHtmlS13(report: Report, opts?: ExportOpts) {
  const created = report.createdAt
    ? new Date(report.createdAt).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const monthLabel = monthNameFromPeriodLabel(report?.periodLabel);
  const name = opts?.name || opts?.author || "";

  const participatedThisMonth = true;
  const includeHours = !!opts?.includeHours;

  const totalHoursHHmm = hoursToHHmm(report.totalHours);
  const totalHoursInt = Math.floor(report.totalHours ?? 0);
  const estudos = countEstudos(report);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Relatório — ${report.periodLabel}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; color: #111; }
  .title { font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 16px; }
  .row { display: grid; grid-template-columns: 120px 1fr; gap: 8px; align-items: center; margin-bottom: 8px; }
  .label { font-weight: 700; font-size: 18px; }
  .field { background: #F3F4F6; padding: 8px 12px; border-radius: 6px; border: 1px solid #E5E7EB; font-size: 18px; }
  .card { border: 2px solid #1F2937; border-radius: 8px; padding: 12px; margin-top: 16px; }
  .line { border-top: 1px solid #D1D5DB; margin: 0; }
  .grid2 { display: grid; grid-template-columns: 1fr 120px; }
  .cell { padding: 8px 12px; border-right: 1px solid #D1D5DB; }
  .cell:last-child { border-right: none; }
  .subtitle { font-weight: 700; font-size: 18px; padding: 8px 12px; }
  .checkbox { display: flex; justify-content: flex-end; align-items: center; padding: 8px; }
  .box { width: 40px; height: 40px; border: 2px solid #111; display: flex; align-items: center; justify-content: center; font-size: 28px; border-radius: 6px; }
  .obs { min-height: 80px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; }
  .muted { color: #6B7280; font-size: 12px; margin-top: 12px; }
  .right { text-align: right; }
</style>
</head>
<body>
  <div class="title">RELATÓRIO DE SERVIÇO DE CAMPO</div>

  <div class="row">
    <div class="label">Nome:</div>
    <div class="field">${name}</div>
  </div>
  <div class="row">
    <div class="label">Mês:</div>
    <div class="field">${monthLabel}</div>
  </div>

  <div class="card">
    <div class="grid2" style="align-items:center;">
      <div class="subtitle">Participei em alguma modalidade do ministério durante o mês.</div>
      ${checkboxSvg(participatedThisMonth)}
    </div>
    <hr class="line" />
    <div class="grid2">
      <div class="subtitle">Estudos bíblicos</div>
      <div class="cell right" style="font-size:18px; font-weight:700;">${
        estudos || ""
      }</div>
    </div>
    <hr class="line" />
    <div class="grid2">
      <div class="subtitle">Horas (preencher apenas se pioneiro/missionário em campo)</div>
      <div class="cell right" style="font-size:22px; font-weight:800;">
        ${includeHours ? totalHoursInt : ""}
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:16px;">
    <div class="subtitle" style="padding-bottom:4px;">Observações:</div>
    <div class="obs">${opts?.notes ? opts.notes : ""}</div>
  </div>

  <div class="muted">
    Gerado em ${created}${opts?.author ? ` • ${opts.author}` : ""}${
    includeHours ? ` • Total (HH:mm): ${totalHoursHHmm}` : ""
  }
  </div>
</body>
</html>`;
}

async function exportReportToPdf(report: Report, opts?: ExportOpts) {
  const html = buildHtmlS13(report, opts);
  const { uri } = await printToFileAsync({ html });

  const baseDir = FS.cacheDirectory ?? FS.documentDirectory;
  if (!baseDir) return uri;
  const fileName = `relatorio-${report.month}.pdf`;
  const dest = `${baseDir}${fileName}`;
  await FS.moveAsync({ from: uri, to: dest });
  return dest;
}

export async function shareReportPdf(report: Report, opts?: ExportOpts) {
  const pdfUri = await exportReportToPdf(report, opts);
  if (await sharingAvailable()) {
    await shareAsync(pdfUri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: `Relatório ${report.periodLabel}`,
    });
  }
  return pdfUri;
}

export async function saveReportPdfToDownloads(
  report: Report,
  opts?: ExportOpts
) {
  const pdfUri = await exportReportToPdf(report, opts);
  if (Platform.OS !== "android" || !FS.StorageAccessFramework) return pdfUri;

  const perm =
    await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!perm.granted) return pdfUri;

  const fileName = `relatorio-${report.month}.pdf`;
  const base64 = await FS.readAsStringAsync(pdfUri, {
    encoding: FS.EncodingType.Base64,
  });
  const destUri = await FS.StorageAccessFramework.createFileAsync(
    perm.directoryUri,
    fileName,
    "application/pdf"
  );
  await FS.writeAsStringAsync(destUri, base64, {
    encoding: FS.EncodingType.Base64,
  });
  return destUri;
}
