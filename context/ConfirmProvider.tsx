import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Modal from "@/components/Modal";
import { Text, View } from "react-native";
import { Button } from "@/components/ui";
import {
  ConfirmContextType,
  ConfirmOptions,
  InternalState,
  Option,
} from "@/type";

const Ctx = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useConfirm deve ser usado dentro de <ConfirmProvider>");
  return ctx;
}

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<InternalState>({
    open: false,
    opts: null,
  });

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, opts, resolve: (v: boolean) => resolve(v) });
    });
  }, []);

  const choose = useCallback((opts: ConfirmOptions & { options: Option[] }) => {
    return new Promise<string | null>((resolve) => {
      setState({ open: true, opts, resolve: (v: string | null) => resolve(v) });
    });
  }, []);

  const handleBackdropClose = useCallback(() => {
    if (state.opts?.dismissible !== false) {
      state.resolve?.(false);
      close();
    }
  }, [state, close]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    close();
  }, [state, close]);

  const handleConfirm = useCallback(
    (key?: string) => {
      if (state.opts?.options?.length) {
        state.resolve?.(key ?? null);
      } else {
        state.resolve?.(true);
      }
      close();
    },
    [state, close]
  );

  const value = useMemo(() => ({ confirm, choose }), [confirm, choose]);

  const opts = state.opts;

  return (
    <Ctx.Provider value={value}>
      {children}

      <Modal
        open={state.open}
        onClose={handleBackdropClose}
        dismissible={opts?.dismissible ?? true}
      >
        {opts && (
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-lg font-bold">{opts.title}</Text>
              {!!opts.message && (
                <Text className="text-gray-700">{opts.message}</Text>
              )}
            </View>

            {opts.options && opts.options.length ? (
              <View className="flex-col gap-2">
                {opts.options.map((op) => (
                  <Button
                    key={op.key}
                    title={op.label}
                    variant={op.variant ?? "primary"}
                    onPress={() => handleConfirm(op.key)}
                  />
                ))}
                <Button
                  title={opts.cancelText ?? "Cancelar"}
                  variant="outline"
                  onPress={handleCancel}
                />
              </View>
            ) : (
              <View className="flex-row gap-2 justify-end">
                <Button
                  title={opts.cancelText ?? "Cancelar"}
                  variant="outline"
                  onPress={handleCancel}
                />
                <Button
                  title={opts.confirmText ?? "OK"}
                  variant={opts.confirmVariant ?? "primary"}
                  onPress={() => handleConfirm()}
                />
              </View>
            )}
          </View>
        )}
      </Modal>
    </Ctx.Provider>
  );
};
