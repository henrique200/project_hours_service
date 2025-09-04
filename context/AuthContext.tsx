import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Profile = {
  email: string;
  nomeCompleto: string;
  dataNascimento: string; // ISO yyyy-mm-dd
  congregacao: string;
  cidade: string;
  estado: string;
};

type AuthCtx = {
  user: Profile | null;
  signIn: (email: string, _password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
};

const PROFILE_KEY = "hs.profile";

/** Context começa como `undefined` para o TS forçar o uso dentro do Provider */
const Ctx = createContext<AuthCtx | undefined>(undefined);

/** Hook seguro: lança erro se usado fora do Provider */
export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) setUser(JSON.parse(raw) as Profile);
      } catch {}
    })();
  }, []);

  async function signIn(email: string, _password: string) {
    // mock simples: não valida senha agora
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) {
      const p: Profile = JSON.parse(raw);
      setUser(p.email === email ? p : { ...p, email });
    } else {
      setUser({
        email,
        nomeCompleto: "",
        dataNascimento: "",
        congregacao: "",
        cidade: "",
        estado: "",
      });
    }
  }

  async function signOut() {
    setUser(null);
  }

  async function saveProfile(p: Profile) {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setUser(p);
  }

  const value: AuthCtx = { user, signIn, signOut, saveProfile };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
