import "../global.css";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { NotesProvider } from "../context/NotesContext";
import { ReportsProvider } from "../context/ReportsContext";
import { ConfirmProvider } from "@/context/ConfirmProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotesProvider>
        <ReportsProvider>
          <StatusBar style="light" />
          <ConfirmProvider>
            <Slot />
          </ConfirmProvider>
        </ReportsProvider>
      </NotesProvider>
    </AuthProvider>
  );
}
