import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import {
  LIMIT_MS,
  msToHoursDecimal,
  pad,
  splitHHMMSS,
  todayIso,
} from "@/Functions";

export default function TimerScreen() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [, setNudge] = useState(0);

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
        Alert.alert("Limite atingido", "O cronômetro atingiu 24h.");
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
  }, [running, elapsedMs]);

  function getShownMs() {
    if (running && startedAtRef.current) {
      const ms = elapsedMs + (Date.now() - startedAtRef.current);
      return ms >= LIMIT_MS ? LIMIT_MS : ms;
    }
    return elapsedMs;
  }

  function handleInicio() {
    setElapsedMs(0);
    setRunning(true);
    startedAtRef.current = Date.now();
  }

  function handlePlayPause() {
    if (running) {
      const now = Date.now();
      const started = startedAtRef.current ?? now;
      const inc = now - started;
      setElapsedMs((prev) => Math.min(prev + inc, LIMIT_MS));
      setRunning(false);
      startedAtRef.current = null;
    } else {
      if (elapsedMs >= LIMIT_MS) return;
      setRunning(true);
      startedAtRef.current = Date.now();
    }
  }

  function resetAll() {
    setRunning(false);
    startedAtRef.current = null;
    setElapsedMs(0);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function handleStop() {
    const shown = getShownMs();
    const hoursDec = msToHoursDecimal(shown);

    Alert.alert(
      "Parar cronômetro",
      "Deseja apenas parar ou salvar o tempo nas anotações?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apenas parar",
          onPress: () => resetAll(),
        },
        {
          text: "Salvar nas anotações",
          onPress: () => {
            if (shown <= 0) {
              Alert.alert("Cronômetro zerado", "Não há tempo para salvar.");
              return;
            }
            router.push({
              pathname: "/(app)/notes/new",
              params: {
                hours: String(hoursDec),
                date: todayIso(),
              },
            } as any);
            resetAll();
          },
        },
      ]
    );
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

      <View className="flex-row gap-3">
        <Pressable
          onPress={handleInicio}
          className="flex-1 bg-brand-900 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">Início</Text>
        </Pressable>

        <Pressable
          onPress={handlePlayPause}
          className="flex-1 bg-accent-600 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">
            {running ? "Pause" : "Play"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleStop}
          className="flex-1 bg-red-600 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}
