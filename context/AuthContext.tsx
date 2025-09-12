import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  confirmPasswordReset as fbConfirmPasswordReset,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AuthCtx, Profile } from "@/type";

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as Profile);
          } else {
            const ref = doc(db, "users", firebaseUser.uid);
            await setDoc(ref, {
              email: firebaseUser.email || "",
              nomeCompleto: "",
              dataNascimento: "",
              congregacao: "",
              cidade: "",
              estado: "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              nomeCompleto: "",
              dataNascimento: "",
              congregacao: "",
              cidade: "",
              estado: "",
            });
          }
        } catch (error) {
          console.error("Erro ao buscar perfil do usuário:", error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  async function signUp(
    email: string,
    password: string,
    profileData: Omit<Profile, "id" | "email" | "createdAt" | "updatedAt">
  ) {
    try {
      setLoading(true);
      const { user: fu } = await createUserWithEmailAndPassword(auth, email, password);

      const profile: Profile = {
        id: fu.uid,
        email: fu.email || "",
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", fu.uid), profile);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }

  async function updateProfile(profileData: Partial<Profile>) {
    if (!firebaseUser) throw new Error("Usuário não está logado");
    try {
      const updatedData = { ...profileData, updatedAt: serverTimestamp() };
      await setDoc(doc(db, "users", firebaseUser.uid), updatedData, { merge: true });
      setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  }

  // 🔹 NOVO: enviar e-mail de redefinição
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email /*, actionCodeSettings opcional */);
  }

  // 🔹 NOVO: confirmar redefinição com o código do e-mail
  async function confirmPasswordReset(oobCode: string, newPassword: string) {
    await fbConfirmPasswordReset(auth, oobCode, newPassword);
  }

  // 🔹 NOVO: alterar senha estando logado (não é o caso de “perdi a senha”, mas útil)
  async function changePassword(newPassword: string) {
    if (!auth.currentUser) throw new Error("Usuário não está logado");
    await updatePassword(auth.currentUser, newPassword);
  }

  const value: AuthCtx = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    // novos
    resetPassword,
    confirmPasswordReset,
    changePassword,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
