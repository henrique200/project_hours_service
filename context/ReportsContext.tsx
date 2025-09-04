import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note } from "./NotesContext";

export type ReportEntry = {
  date: string;     // yyyy-mm-dd
  hours: number;
  revisita: boolean;
};

export type Report = {
  id: string;
  month: string;        // yyyy-mm (ex.: "2025-09")
  periodLabel: string;  // ex.: "Setembro/2025"
  entries: ReportEntry[];
  totalHours: number;
  isClosed: boolean;    // mês já finalizado?
  createdAt: string;    // ISO
};

type ReportsCtx = {
  reports: Report[];
  generateAndSaveCurrentMonth: (notes: Note[]) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  findByMonth: (yyyyMM: string) => Report | undefined;
};

const KEY = "hs.reports";
const Ctx = createContext<ReportsCtx | undefined>(undefined);

export const useReports = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReports deve ser usado dentro de <ReportsProvider>");
  return ctx;
};

function monthFromDateISO(dateISO: string) {
  // "2025-09-03" -> "2025-09"
  return dateISO.slice(0, 7);
}

function monthLabel(yyyyMM: string) {
  const [yStr, mStr] = yyyyMM.split("-");
  const y = Number(yStr);
  const m = Number(mStr);

  // Trata números inválidos sem usar "??"
  const now = new Date();
  const year = Number.isFinite(y) ? y : now.getFullYear();
  const monthIndex = Number.isFinite(m) && m >= 1 && m <= 12 ? m - 1 : now.getMonth();

  const dt = new Date(year, monthIndex, 1);
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  const label = formatter.format(dt);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isClosedMonth(yyyyMM: string) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return yyyyMM !== current;
}

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setReports(JSON.parse(raw) as Report[]);
      } catch {}
    })();
  }, []);

  async function persist(next: Report[]) {
    setReports(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }

  function findByMonth(yyyyMM: string) {
    return reports.find(r => r.month === yyyyMM);
  }

  async function deleteReport(id: string) {
    const next = reports.filter(r => r.id !== id);
    await persist(next);
  }

  async function generateAndSaveCurrentMonth(notes: Note[]) {
    const now = new Date();
    const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // filtra notas do mês atual
    const monthNotes = notes.filter(n => monthFromDateISO(n.date) === yyyyMM);

    // agrega por dia (não editável)
    const entries = monthNotes
      .sort((a, b) => a.date.localeCompare(b.date))
      .map<ReportEntry>(n => ({
        date: n.date,
        hours: n.hours,
        revisita: Boolean(n.revisita?.enabled),
      }));

    const totalHours = Number(entries.reduce((sum, e) => sum + e.hours, 0).toFixed(2));
    const report: Report = {
      id: `${yyyyMM}-${Date.now()}`,
      month: yyyyMM,
      periodLabel: monthLabel(yyyyMM),
      entries,
      totalHours,
      isClosed: isClosedMonth(yyyyMM),
      createdAt: new Date().toISOString(),
    };

    // substitui o do mesmo mês, se existir
    const withoutSameMonth = reports.filter(r => r.month !== yyyyMM);
    const next = [report, ...withoutSameMonth].sort((a, b) => b.month.localeCompare(a.month));
    await persist(next);
    return report;
  }

  const value = useMemo<ReportsCtx>(() => ({
    reports,
    generateAndSaveCurrentMonth,
    deleteReport,
    findByMonth,
  }), [reports]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
