import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Variant = "primary" | "secondary" | "accent" | "outline" | "destructive" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  testID?: string;
};

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
  className = "",
  textClassName = "",
  testID,
}: ButtonProps) {
  const v = variantClasses[variant];
  const isDisabled = disabled || loading;

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
