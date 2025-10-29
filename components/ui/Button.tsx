import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";


import {Entypo, AntDesign, Ionicons, FontAwesome, MaterialCommunityIcons} from "@expo/vector-icons"

import { ButtonProps, Size, Variant } from "@/type";

const variantClasses: Record<Variant, { container: string; text: string; border?: string }> = {
  primary:     { container: "bg-brand-900",  text: "text-white" },
  secondary:   { container: "bg-accent-600", text: "text-white" },
  accent:      { container: "bg-accent-600", text: "text-white" },
  outline:     { container: "bg-transparent", text: "text-brand-900", border: "border border-brand-900" },
  destructive: { container: "bg-red-600",    text: "text-white" },
  ghost:       { container: "bg-transparent", text: "text-gray-900" },

};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 rounded-lg",
  md: "px-4 py-3 rounded-xl",
  lg: "px-5 py-4 rounded-2xl",
  iconsSized: "",
};

export function Button({
  title,
  children,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  icon,
  className = "",
  textClassName = "",
  testID,
  sizeIcon = 16,
}: ButtonProps) {
  const v = variantClasses[variant];
  const isDisabled = disabled || loading;

  const renderIcon = () => {
    const color = v.text.includes("text-white") ? "#fff" : "#000";

    switch (icon) {
      case "edit":
        return <Entypo name="edit" size={sizeIcon} color={color} />;
      case "delete":
        return <AntDesign name="delete" size={sizeIcon} color={color} />;

        case "play": 
          return <FontAwesome name="play" size={sizeIcon} color="white" />;

        case "pause": 
          return <Ionicons name="pause" size={sizeIcon} color='white' />;

        case "stop":
          return <FontAwesome name="stop" size={sizeIcon} color={color} />

        case 'init':
          return <AntDesign name="playcircleo" size={sizeIcon} color={color} />;

        case 'share':
          return <Entypo name="share" size={sizeIcon} color={color} />

        case 'save':
          return <FontAwesome name="save" size={sizeIcon} color={color} />


      default:
        return null;
    }
  };

  const onlyIcon = !title && !children && icon;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      className={[
        "flex-row items-center justify-center gap-2",
        v.container,
        v.border ?? "",
        sizeClasses[size],
        isDisabled ? "opacity-60" : "",
        className,
      ].join(" ").trim()}
    >
      {loading ? (
        <ActivityIndicator color={v.text.includes("text-white") ? "#fff" : "#000"} />
      ) : onlyIcon ? (
        renderIcon()
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          {children ? (
            children
          ) : (
            <Text className={[v.text, "font-semibold", textClassName].join(" ").trim()}>
              {title}
            </Text>
          )}
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}

export default Button;
