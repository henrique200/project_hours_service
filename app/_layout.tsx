import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { NotesProvider } from "../context/NotesContext";
import { ReportsProvider } from "@/context/ReportsContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotesProvider>
        <ReportsProvider>
          <Slot />
        </ReportsProvider>
      </NotesProvider>
    </AuthProvider>
  );
}
