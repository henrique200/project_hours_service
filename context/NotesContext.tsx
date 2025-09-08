import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Note = {
  id: string;
  date: string;
  hours: number;
  locationNotes?: string;
  actions: string[];
  revisita: {
    enabled: boolean;
    nome?: string;
    numeroCasa?: string;
    celular?: string;
    data?: string;
    horario?: string;
  };
};

type NotesCtx = {
  notes: Note[];
  addNote: (n: Note) => Promise<void>;
  updateNote: (n: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  clearAll: () => Promise<void>;
};

const NOTES_KEY = "hs.notes";

const Ctx = createContext<NotesCtx | undefined>(undefined);

export const useNotes = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useNotes deve ser usado dentro de <NotesProvider>");
  return ctx;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (raw) setNotes(JSON.parse(raw) as Note[]);
      } catch {}
    })();
  }, []);

  async function persist(next: Note[]) {
    setNotes(next);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  async function addNote(n: Note) {
    await persist([n, ...notes]);
  }

  async function updateNote(n: Note) {
    const next = notes.map((it) => (it.id === n.id ? n : it));
    await persist(next);
  }

  async function deleteNote(id: string) {
    const next = notes.filter((n) => n.id !== id);
    await persist(next);
  }

  function getNote(id: string) {
    return notes.find((n) => n.id === id);
  }

  async function clearAll() {
    await persist([]);
  }

  const value: NotesCtx = {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    clearAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
