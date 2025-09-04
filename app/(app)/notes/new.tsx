import { View } from "react-native";
import { router } from "expo-router";
import { useNotes } from "../../../context/NotesContext";
import NoteForm from "../../../components/NoteForm";

export default function NewNote() {
  const { addNote } = useNotes();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <NoteForm
        onSubmit={async (note) => {
          await addNote(note);
          router.back();
        }}
      />
    </View>
  );
}
