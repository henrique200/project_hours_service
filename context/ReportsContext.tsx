import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  collection, doc, deleteDoc, query, where, orderBy,
  serverTimestamp, onSnapshot, setDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { Note, Report, ReportEntry, ReportsCtx } from "@/type";

import { A_REV_3_ESTUDO, A_REV_3_ESTUDO_SF } from "@/constants/noteActions";

const COLLECTION_NAME = "reports";

const Ctx = createContext<ReportsCtx | undefined>(undefined);

export const useReports = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReports deve ser usado dentro de <ReportsProvider>");
  return ctx;
};

function monthFromDateISO(dateISO: string) {
  return dateISO.slice(0, 7);
}

function monthLabel(yyyyMM: string) {
  const [yStr, mStr] = yyyyMM.split("-");
  const y = Number(yStr);
  const m = Number(mStr);

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

function isEnabledField(val: any): boolean {
  if (typeof val === "boolean") return val;
  if (val && typeof val === "object" && "enabled" in val) return !!val.enabled;
  return false;
}

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const reportsRef = collection(db, COLLECTION_NAME);
    const q = query(reportsRef, where("userId", "==", user.id), orderBy("month", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reportsData: Report[] = [];
        querySnapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() } as Report);
        });
        setReports(reportsData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar relatórios:", error);
        setError("Erro ao carregar relatórios");
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [user?.id]);

  function findByMonth(yyyyMM: string) {
    return reports.find((r) => r.month === yyyyMM);
  }

  async function deleteReport(id: string) {
    try {
      const reportRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(reportRef);
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      setError("Erro ao excluir relatório");
      throw error;
    }
  }

  async function generateAndSaveCurrentMonth(notes: Note[]) {
    if (!user?.id) throw new Error("Usuário não está logado");

    try {
      const now = new Date();
      const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const monthNotes = notes.filter((n) => monthFromDateISO(n.date) === yyyyMM);

      const entries: ReportEntry[] = monthNotes
        .sort((a, b) => a.date.localeCompare(b.date))
        .map<ReportEntry>((n) => {
          const revisita = isEnabledField(n.revisita);

          const estudoFromField = isEnabledField((n as any).estudo);
          const estudoFromActions =
            Array.isArray(n.actions) &&
            n.actions.some((a) => a === A_REV_3_ESTUDO || a === A_REV_3_ESTUDO_SF);

          const estudo = Boolean(estudoFromField || estudoFromActions);

          return {
            date: n.date,
            hours: n.hours,
            revisita,
            estudo,
          };
        });

      const totalHours = Number(entries.reduce((sum, e) => sum + e.hours, 0).toFixed(2));

      const report: Report = {
        id: `${user.id}-${yyyyMM}`,
        month: yyyyMM,
        periodLabel: monthLabel(yyyyMM),
        entries,
        totalHours,
        isClosed: isClosedMonth(yyyyMM),
        createdAt: new Date().toISOString(),
        userId: user.id,
      };

      const reportRef = doc(db, COLLECTION_NAME, report.id);
      await setDoc(
        reportRef,
        {
          ...report,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return report;
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setError("Erro ao gerar relatório");
      throw error;
    }
  }

  const value = useMemo<ReportsCtx>(
    () => ({
      reports,
      loading,
      error,
      generateAndSaveCurrentMonth,
      deleteReport,
      findByMonth,
    }),
    [reports, loading, error]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
