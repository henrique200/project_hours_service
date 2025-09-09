import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
// import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import { Note } from "./NotesContext";
import { db } from "@/lib/firebase";

export type ReportEntry = {
  date: string; // yyyy-mm-dd
  hours: number;
  revisita: boolean;
};

export type Report = {
  id: string;
  month: string;
  periodLabel: string;
  entries: ReportEntry[];
  totalHours: number;
  isClosed: boolean;
  createdAt?: any;    // Timestamp | undefined
  userId?: string;
  updatedAt?: any;
};


type ReportsCtx = {
  reports: Report[];
  loading: boolean;
  error: string | null;
  generateAndSaveCurrentMonth: (notes: Note[]) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  findByMonth: (yyyyMM: string) => Report | undefined;
};

const COLLECTION_NAME = "reports";

const Ctx = createContext<ReportsCtx | undefined>(undefined);

export const useReports = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useReports deve ser usado dentro de <ReportsProvider>");
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
  const monthIndex =
    Number.isFinite(m) && m >= 1 && m <= 12 ? m - 1 : now.getMonth();

  const dt = new Date(year, monthIndex, 1);
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const label = formatter.format(dt);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isClosedMonth(yyyyMM: string) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  return yyyyMM !== current;
}

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

    // Configurar listener em tempo real para os relatórios do usuário
    const reportsRef = collection(db, COLLECTION_NAME);
    const q = query(
      reportsRef,
      where("userId", "==", user.id),
      orderBy("month", "desc")
    );

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

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
    if (!user?.id) {
      throw new Error("Usuário não está logado");
    }

    try {
      const now = new Date();
      const yyyyMM = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      // filtra notas do mês atual
      const monthNotes = notes.filter(
        (n) => monthFromDateISO(n.date) === yyyyMM
      );

      // agrega por dia (não editável)
      const entries = monthNotes
        .sort((a, b) => a.date.localeCompare(b.date))
        .map<ReportEntry>((n) => ({
          date: n.date,
          hours: n.hours,
          revisita: Boolean(n.revisita?.enabled),
        }));

      const totalHours = Number(
        entries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)
      );

      const report: Report = {
        id: `${user.id}-${yyyyMM}`, // ID único baseado no usuário e mês
        month: yyyyMM,
        periodLabel: monthLabel(yyyyMM),
        entries,
        totalHours,
        isClosed: isClosedMonth(yyyyMM),
        createdAt: new Date().toISOString(),
        userId: user.id,
      };

      // Usar setDoc para sobrescrever o relatório do mesmo mês se existir
      const reportRef = doc(db, COLLECTION_NAME, report.id);
      await setDoc(
        reportRef,
        {
          ...report,
          createdAt: serverTimestamp(), // padroniza com server time
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ); // merge preserva createdAt se já existir

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
