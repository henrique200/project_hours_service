import { InputProps } from "@/type";
import { Entypo } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import { TextInput, View, Pressable, Text } from "react-native";

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    error,
    left,
    right,
    secureTextEntry,
    secureToggle,
    containerClassName = "",
    inputClassName = "",
    ...rest
  },
  ref
) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const borderClasses = error ? "border-red-500" : "border-gray-300";

  return (
    <View className={["w-full", containerClassName].join(" ").trim()}>
      <View
        className={[
          "flex-row items-center rounded-xl bg-white border",
          borderClasses,
          "px-3",
        ]
          .join(" ")
          .trim()}
      >
        {left ? <View className="mr-2">{left}</View> : null}

        <TextInput
          ref={ref}
          className={["flex-1 py-3 text-gray-900", inputClassName]
            .join(" ")
            .trim()}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor="#9CA3AF"
          {...rest}
        />

        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            className="ml-2 px-1 py-2"
            accessibilityRole="button"
          >
            {hidden ? (
              <Entypo name="eye" size={24} color="gray" />
            ) : (
              <Entypo name="eye-with-line" size={24} color="gray" />
            )}
          </Pressable>
        ) : right ? (
          <View className="ml-2">{right}</View>
        ) : null}
      </View>

      {error ? (
        <Text className="text-red-600 mt-1 text-xs">{error}</Text>
      ) : null}
    </View>
  );
});
