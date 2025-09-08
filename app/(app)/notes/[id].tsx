import { View, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNotes } from "../../../context/NotesContext";
import NoteForm from "../../../components/NoteForm";

export default function EditNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, updateNote } = useNotes();
  const current = getNote(id!);
  if (!current) return <View className="p-4"><Text>Não encontrado.</Text></View>;

  return (
    <View className="flex-1 p-4 bg-white">
      <NoteForm initial={current} onSubmit={async (note) => { await updateNote(note); router.back(); }} />
    </View>
  );
}
