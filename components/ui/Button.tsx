import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Entypo, AntDesign, Ionicons, FontAwesome } from "@expo/vector-icons";
import { ButtonProps, Size, Variant } from "@/type";

const variantClasses: Record<
  Variant,
  { container: string; text: string; border?: string }
> = {
  primary: { container: "bg-brand-900", text: "text-white" },
  secondary: { container: "bg-accent-600", text: "text-white" },
  accent: { container: "bg-accent-600", text: "text-white" },
  outline: {
    container: "bg-transparent",
    text: "text-brand-900",
    border: "border border-brand-900",
  },
  destructive: { container: "bg-red-600", text: "text-white" },
  ghost: { container: "bg-transparent", text: "text-gray-900" },
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
        return <FontAwesome name="play" size={sizeIcon} color={color} />;
      case "pause":
        return <Ionicons name="pause" size={sizeIcon} color={color} />;
      case "stop":
        return <FontAwesome name="stop" size={sizeIcon} color={color} />;
      case "share":
        return <Entypo name="share" size={sizeIcon} color={color} />;
      case "save":
        return <FontAwesome name="save" size={sizeIcon} color={color} />;
      default:
        return null;
    }
  };

  const onlyIcon = !title && !children && icon;

  const renderChildren = () => {
    if (children === null || children === undefined) {
      return (
        <Text
          className={[v.text, "font-semibold", textClassName].join(" ").trim()}
        >
          {title}
        </Text>
      );
    }

    if (typeof children === "string" || typeof children === "number") {
      return (
        <Text
          className={[v.text, "font-semibold", textClassName].join(" ").trim()}
        >
          {children}
        </Text>
      );
    }

    return children;
  };

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
      ]
        .join(" ")
        .trim()}
    >
      {loading ? (
        <ActivityIndicator
          color={v.text.includes("text-white") ? "#fff" : "#000"}
        />
      ) : onlyIcon ? (
        renderIcon()
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon ? <View>{leftIcon}</View> : null}
          {renderChildren()}
          {rightIcon ? <View>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

export default Button;
