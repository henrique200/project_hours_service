import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { Note, NotesCtx } from "@/type";

const COLLECTION_NAME = "notes";
const Ctx = createContext<NotesCtx | undefined>(undefined);

export const useNotes = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useNotes deve ser usado dentro de <NotesProvider>");
  return ctx;
};

// remove undefined recursivamente (objetos/arrays)
function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((v) => pruneUndefined(v))
      .filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value as any)) {
      const pv = pruneUndefined(v as any);
      if (pv !== undefined) out[k] = pv;
    }
    return out;
  }
  return value;
}

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const notesRef = collection(db, COLLECTION_NAME);
    const qy = query(
      notesRef,
      where("userId", "==", user.id),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      qy,
      (snap) => {
        const list: Note[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          if ("id" in data) delete data.id; // ✅ evita sobrescrever com id do payload
          list.push({ ...(data as any), id: d.id } as Note); // ✅ doc.id vence
        });
        setNotes(list);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao buscar notas:", err);
        setError("Erro ao carregar notas");
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [user?.id]);

  async function addNote(
    noteData: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">
  ) {
    if (!user?.id) throw new Error("Usuário não está logado");
    try {
      const notesRef = collection(db, COLLECTION_NAME);

      // ✅ não envie 'id' para o Firestore
      const { id: _drop, ...rest } = noteData as any;

      const payload = pruneUndefined({
        ...rest,
        userId: user.id,
        monthKey: rest.date.slice(0, 7), // "yyyy-MM"
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(notesRef, payload);
    } catch (err) {
      console.error("Erro ao adicionar nota:", err);
      setError("Erro ao adicionar nota");
      throw err;
    }
  }

  async function updateNote(note: Note) {
    if (!user?.id) throw new Error("Usuário não está logado");
    try {
      const noteRef = doc(db, COLLECTION_NAME, note.id);
      const { id, userId, createdAt, ...updateData } = note;

      const payload = pruneUndefined({
        ...updateData,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(noteRef, payload);
    } catch (err) {
      console.error("Erro ao atualizar nota:", err);
      setError("Erro ao atualizar nota");
      throw err;
    }
  }

  async function deleteNote(id: string) {
    try {
      const noteRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(noteRef);
    } catch (err) {
      console.error("Erro ao excluir nota:", err);
      setError("Erro ao excluir nota");
      throw err;
    }
  }

  function getNote(id: string) {
    return notes.find((n) => n.id === id);
  }

  async function clearAll() {
    if (!user?.id) throw new Error("Usuário não está logado");
    try {
      const notesRef = collection(db, COLLECTION_NAME);
      const qy = query(notesRef, where("userId", "==", user.id));
      const snap = await getDocs(qy);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch (err) {
      console.error("Erro ao limpar todas as notas:", err);
      setError("Erro ao limpar notas");
      throw err;
    }
  }

  const value: NotesCtx = {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    clearAll,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
