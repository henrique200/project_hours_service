import { FieldProps } from "@/type";
import React from "react";
import { View, Text } from "react-native";

export function Field({
  label,
  required,
  error,
  children,
  className = "",
  labelClassName = "",
}: FieldProps) {
  return (
    <View className={["w-full", className].join(" ").trim()}>
      {label ? (
        <Text
          className={["mb-1 text-gray-900 font-semibold", labelClassName]
            .join(" ")
            .trim()}
        >
          {label} {required ? <Text className="text-red-600">*</Text> : null}
        </Text>
      ) : null}

      {children}

      {error ? (
        <Text className="text-red-600 mt-1 text-xs">{error}</Text>
      ) : null}
    </View>
  );
}
