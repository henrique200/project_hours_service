import { View, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useNotes } from "../../../context/NotesContext";
import NoteForm from "../../../components/NoteForm";

export default function EditNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, updateNote } = useNotes();
  const current = getNote(id!);
  if (!current)
    return (
      <View style={{ padding: 16 }}>
        <Text>Não encontrado.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <NoteForm
        initial={current}
        onSubmit={async (note) => {
          await updateNote(note);
          router.back();
        }}
      />
    </View>
  );
}
