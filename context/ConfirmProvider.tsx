import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text } from "react-native";
import Checkbox from "expo-checkbox";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "secondary" | "destructive";
};

type RessalvaOptions = {
  title?: string;
  periodLabel?: string;
  confirmText?: string;
  cancelText?: string;
};

export type RessalvaResult = {
  includeHours: boolean;
  pioneiro: boolean;
  missionario: boolean;
  testemunhoPublico: boolean;
  answeredYes: boolean;
};

type ConfirmContextValue = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  askRessalva: (opts?: RessalvaOptions) => Promise<RessalvaResult>;
};

const ConfirmContext = createContext<ConfirmContextValue | undefined>(
  undefined
);

type Mode =
  | { type: "none" }
  | ({ type: "confirm" } & ConfirmOptions)
  | ({ type: "ressalva" } & RessalvaOptions);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const resolverRef = useRef<((v: unknown) => void) | null>(null);

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>({ type: "none" });

  const [pioneiro, setPioneiro] = useState(false);
  const [missionario, setMissionario] = useState(false);
  const [testemunhoPublico, setTestemunhoPublico] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    setMode({ type: "none" });
    setPioneiro(false);
    setMissionario(false);
    setTestemunhoPublico(false);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve as (v: unknown) => void;
      setMode({ type: "confirm", ...opts });
      setVisible(true);
    });
  }, []);

  const askRessalva = useCallback((opts?: RessalvaOptions) => {
    return new Promise<RessalvaResult>((resolve) => {
      resolverRef.current = resolve as (v: unknown) => void;
      setMode({ type: "ressalva", ...opts });
      setVisible(true);
    });
  }, []);

  const onCancel = useCallback(() => {
    if (mode.type === "confirm") {
      resolverRef.current?.(false);
      close();
      return;
    }
    if (mode.type === "ressalva") {
      resolverRef.current?.({
        includeHours: false,
        pioneiro: false,
        missionario: false,
        testemunhoPublico: false,
        answeredYes: false,
      } as RessalvaResult);
      close();
    }
  }, [mode, close]);

  const onConfirm = useCallback(() => {
    if (mode.type === "confirm") {
      resolverRef.current?.(true);
      close();
      return;
    }
    if (mode.type === "ressalva") {
      const includeHours = pioneiro || missionario;
      resolverRef.current?.({
        includeHours,
        pioneiro,
        missionario,
        testemunhoPublico,
        answeredYes: true,
      } as RessalvaResult);
      close();
    }
  }, [mode, close, pioneiro, missionario, testemunhoPublico]);

  const value = useMemo<ConfirmContextValue>(
    () => ({ confirm, askRessalva }),
    [confirm, askRessalva]
  );

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Modal open={visible} onClose={onCancel} dismissible>
        {mode.type === "confirm" && (
          <View>
            {mode.title ? (
              <Text className="text-lg font-bold mb-1">{mode.title}</Text>
            ) : null}
            {mode.message ? (
              <Text className="text-gray-700 mb-4">{mode.message}</Text>
            ) : null}

            <View className="flex-row justify-end gap-2 mt-2">
              <Button variant="secondary" onPress={onCancel}>
                {mode.cancelText ?? "Cancelar"}
              </Button>
              <Button
                variant={mode.confirmVariant ?? "primary"}
                onPress={onConfirm}
              >
                {mode.confirmText ?? "Confirmar"}
              </Button>
            </View>
          </View>
        )}

        {mode.type === "ressalva" && (
          <View>
            <Text className="text-lg font-bold mb-2">
              {mode.title ?? "Ressalva do mês"}
            </Text>

            <View className="flex-row items-center mb-2">
              <Checkbox
                value={pioneiro}
                onValueChange={setPioneiro}
                color={pioneiro ? "#2563EB" : undefined}
              />
              <Text className="ml-2 text-base">
                Atuei como Pioneiro (Auxiliar, Regular ou Especial)
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Checkbox
                value={missionario}
                onValueChange={setMissionario}
                color={missionario ? "#2563EB" : undefined}
              />
              <Text className="ml-2 text-base">
                Atuei como Missionário em campo
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Checkbox
                value={testemunhoPublico}
                onValueChange={setTestemunhoPublico}
                color={testemunhoPublico ? "#2563EB" : undefined}
              />
              <Text className="ml-2 text-base">
                Participei de Testemunho público
              </Text>
            </View>

            <Text className="mt-3 text-base font-semibold">
              Este mês{mode.periodLabel ? ` (${mode.periodLabel})` : ""}?
            </Text>

            <View className="flex-row justify-end gap-2 mt-3">
              <Button variant="secondary" onPress={onCancel}>
                {mode.cancelText ?? "Não"}
              </Button>
              <Button variant="primary" onPress={onConfirm}>
                {mode.confirmText ?? "Sim"}
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export default ConfirmProvider;
