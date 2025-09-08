import '../global.css';
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { NotesProvider } from "../context/NotesContext";
import { ReportsProvider } from "../context/ReportsContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotesProvider>
        <ReportsProvider>
          <StatusBar style="light" />
          <Slot />
        </ReportsProvider>
      </NotesProvider>
    </AuthProvider>
  );
}
