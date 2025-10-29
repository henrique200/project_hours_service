import { useEffect, useRef, useState } from "react";
import { View, Text, AppState, AppStateStatus } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LIMIT_MS,
  msToHoursDecimal,
  pad,
  splitHHMMSS,
  todayIso,
} from "@/Functions";
import { Button } from "@/components/ui";
import { useConfirm } from "@/context/ConfirmProvider";
import { PersistedState } from "@/type";

const STORAGE_KEY = "TIMER_STATE_V1";

export default function TimerScreen() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const persistRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [, setNudge] = useState(0);

  const confirm = useConfirm();

  async function saveStateSnap(
    snapElapsed: number,
    snapRunning: boolean,
    snapStartedAt?: number
  ) {
    try {
      const toSave: PersistedState = {
        elapsedMs: snapElapsed,
        running: snapRunning,
        startedAt: snapRunning ? snapStartedAt : undefined,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }

  async function loadState(): Promise<PersistedState | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedState;
    } catch {
      return null;
    }
  }

  function getShownMs() {
    if (running && startedAtRef.current) {
      const ms = elapsedMs + (Date.now() - startedAtRef.current);
      return ms >= LIMIT_MS ? LIMIT_MS : ms;
    }
    return elapsedMs;
  }

  async function hydrateFromStorage() {
    const s = await loadState();
    if (!s) return;

    let newElapsed = s.elapsedMs;
    if (s.running && s.startedAt) {
      newElapsed = Math.min(LIMIT_MS, s.elapsedMs + (Date.now() - s.startedAt));
    }

    setElapsedMs(newElapsed);
    const shouldRun = s.running && newElapsed < LIMIT_MS;
    setRunning(shouldRun);
    startedAtRef.current = shouldRun ? Date.now() : null;

    await saveStateSnap(
      newElapsed,
      shouldRun,
      startedAtRef.current ?? undefined
    );
  }

  useEffect(() => {
    function onChange(next: AppStateStatus) {
      if (next === "background" || next === "inactive") {
        const snap = getShownMs();
        saveStateSnap(snap, running, running ? Date.now() : undefined);
      } else if (next === "active") {
        hydrateFromStorage();
      }
    }
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, elapsedMs]);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (!running) return;

    tickRef.current = setInterval(() => {
      const now = Date.now();
      const started = startedAtRef.current ?? now;
      const currentMs = elapsedMs + (now - started);

      if (currentMs >= LIMIT_MS) {
        setElapsedMs(LIMIT_MS);
        setRunning(false);
        startedAtRef.current = null;
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        saveStateSnap(LIMIT_MS, false, undefined);
        confirm.confirm({
          title: "Limite atingido",
          message: "O cronômetro atingiu 24h.",
          confirmText: "OK",
        });
      } else {
        setNudge((n) => (n + 1) % 1_000_000);
      }
    }, 250);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [running, elapsedMs, confirm]);

  useEffect(() => {
    if (persistRef.current) {
      clearInterval(persistRef.current);
      persistRef.current = null;
    }
    if (!running) return;

    persistRef.current = setInterval(() => {
      const snap = getShownMs();
      saveStateSnap(snap, true, Date.now());
    }, 5000);

    return () => {
      if (persistRef.current) {
        clearInterval(persistRef.current);
        persistRef.current = null;
      }
    };
  }, [running, elapsedMs]);

  useEffect(() => {
    return () => {
      const snap = getShownMs();
      saveStateSnap(snap, running, running ? Date.now() : undefined);
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (persistRef.current) {
        clearInterval(persistRef.current);
        persistRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePlayPause() {
    if (running) {
      const now = Date.now();
      const started = startedAtRef.current ?? now;
      const inc = now - started;
      const next = Math.min(elapsedMs + inc, LIMIT_MS);
      setElapsedMs(next);
      setRunning(false);
      startedAtRef.current = null;
      await saveStateSnap(next, false, undefined);
    } else {
      if (elapsedMs >= LIMIT_MS) return;
      setRunning(true);
      startedAtRef.current = Date.now();
      await saveStateSnap(elapsedMs, true, startedAtRef.current);
    }
  }

  async function resetAll() {
    setRunning(false);
    startedAtRef.current = null;
    setElapsedMs(0);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (persistRef.current) {
      clearInterval(persistRef.current);
      persistRef.current = null;
    }
    await saveStateSnap(0, false, undefined);
  }

  async function handleStop() {
    const shown = getShownMs();
    const hoursDec = msToHoursDecimal(shown);

    const choice = await confirm.choose({
      title: "Parar cronômetro",
      message: "Deseja apenas parar ou salvar o tempo nas anotações?",
      options: [
        { key: "stop", label: "Apenas parar", variant: "secondary" },
        { key: "save", label: "Salvar nas anotações", variant: "primary" },
      ],
      cancelText: "Cancelar",
      dismissible: true,
    });

    if (choice === "stop") {
      await resetAll();
      return;
    }

    if (choice === "save") {
      if (shown <= 0) {
        await confirm.confirm({
          title: "Cronômetro zerado",
          message: "Não há tempo para salvar.",
          confirmText: "OK",
        });
        return;
      }

      router.push({
        pathname: "/(app)/notes/new",
        params: { hours: String(hoursDec), date: todayIso() },
      } as any);
      await resetAll();
      return;
    }
  }

  const shown = getShownMs();
  const { hh, mm, ss } = splitHHMMSS(shown);

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 items-center justify-center">
        <Text className="text-5xl font-extrabold tracking-wider">
          {pad(hh)}:{pad(mm)}:{pad(ss)}
        </Text>
        <Text className="text-gray-500 mt-2">Limite: 24:00:00</Text>
      </View>

      <View className="flex-row gap-3 items-center justify-center">
        <Button
          icon={running ? "pause" : "play"}
          variant="secondary"
          className="rounded-full w-[50px] h-[50px]"
          onPress={handlePlayPause}
        />
        <Button
          icon="stop"
          variant="destructive"
          className="rounded-full w-[50px] h-[50px]"
          onPress={handleStop}
        />
      </View>
    </View>
  );
}
