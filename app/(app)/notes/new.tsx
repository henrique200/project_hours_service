import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useNotes } from "../../../context/NotesContext";
import NoteForm from "../../../components/NoteForm";
import type { Note } from "../../../context/NotesContext";

export default function NewNote() {
  const { addNote } = useNotes();

  const params = useLocalSearchParams<{ hours?: string; date?: string }>();

  const initial: Partial<Note> = {};

  if (typeof params.hours === "string") {
    const n = Number(params.hours);
    if (Number.isFinite(n)) initial.hours = n; 
  }

  if (typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    initial.date = params.date; 
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <NoteForm
        initial={initial}
        onSubmit={async (note) => {
          await addNote(note);
          router.back();
        }}
      />
    </View>
  );
}
