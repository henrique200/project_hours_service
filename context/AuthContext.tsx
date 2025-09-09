import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
// import { auth, db } from "../config/firebase";

export type Profile = {
  id: string;
  email: string;
  nomeCompleto: string;
  dataNascimento: string; // ISO yyyy-mm-dd
  congregacao: string;
  cidade: string;
  estado: string;
  createdAt?: any;
  updatedAt?: any;
};

type AuthCtx = {
  user: Profile | null;
  firebaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    profileData: Omit<Profile, "id" | "email" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Buscar dados do perfil no Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as Profile);
          } else {
            // Se não existe perfil no Firestore, criar um básico
            const ref = doc(db, "users", firebaseUser.uid);

            // payload com timestamps do servidor (NÃO colocar no state)
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

            // estado local "limpo" sem FieldValue (usa dados mínimos)
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
      // O onAuthStateChanged vai cuidar de atualizar o estado
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
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Salvar dados do perfil no Firestore
      const profile: Profile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), profile);
      // O onAuthStateChanged vai cuidar de atualizar o estado
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
      const updatedData = {
        ...profileData,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), updatedData, {
        merge: true,
      });

      // Atualizar estado local
      setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  }

  const value: AuthCtx = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
