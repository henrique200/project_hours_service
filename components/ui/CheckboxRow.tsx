import React from "react";
import { Pressable, Text, View } from "react-native";
import Checkbox from "expo-checkbox";

export type CheckboxRowProps = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function CheckboxRow({
  label,
  value,
  onValueChange,
  description,
  disabled,
  className = "",
}: CheckboxRowProps) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      className={[
        "flex-row items-center gap-3 py-2",
        disabled ? "opacity-50" : "",
        className,
      ].join(" ").trim()}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
    >
      <Checkbox value={value} onValueChange={onValueChange} disabled={disabled} />
      <View className="flex-1">
        <Text className="text-gray-900">{label}</Text>
        {description ? <Text className="text-gray-500 text-sm">{description}</Text> : null}
      </View>
    </Pressable>
  );
}
