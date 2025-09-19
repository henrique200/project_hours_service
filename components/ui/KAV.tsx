// components/layout/KAV.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BaseProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Fecha o teclado ao tocar fora dos inputs (default: true) */
  dismissOnTapOutside?: boolean;
  /** Offset extra além do topo da safe-area (ex.: altura do header) */
  extraOffset?: number;
  /** Força um behavior específico (default: padding no iOS, height no Android) */
  behavior?: "height" | "position" | "padding";
};

export default function KAV({
  children,
  style,
  dismissOnTapOutside = true,
  extraOffset = 0,
  behavior,
}: BaseProps) {
  const insets = useSafeAreaInsets();
  const offset = (Platform.OS === "ios" ? insets.top : 0) + extraOffset;

  const content = dismissOnTapOutside ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} touchSoundDisabled>
      {children as any}
    </TouchableWithoutFeedback>
  ) : (
    <>{children}</>
  );

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior ?? (Platform.OS === "ios" ? "padding" : "height")}
      keyboardVerticalOffset={offset}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

type KAVScrollProps = BaseProps & {
  /** Estilo do conteúdo do ScrollView */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Props adicionais para o ScrollView */
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle">;
  /** paddingBottom extra no conteúdo (para não esconder botões) */
  contentBottomPadding?: number;
};

/** Versão com ScrollView embutido (ideal para formulários longos) */
export function KAVScroll({
  children,
  style,
  dismissOnTapOutside = true,
  extraOffset = 0,
  behavior,
  contentContainerStyle,
  contentBottomPadding = 32,
  scrollProps,
}: KAVScrollProps) {
  const insets = useSafeAreaInsets();
  const offset = (Platform.OS === "ios" ? insets.top : 0) + extraOffset;

  const scroll = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{flex: 1}}
      contentContainerStyle={[{ paddingBottom: contentBottomPadding }, contentContainerStyle]}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior ?? (Platform.OS === "ios" ? "padding" : "height")}
      keyboardVerticalOffset={offset}
    >
      {dismissOnTapOutside ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} touchSoundDisabled>
          {scroll}
        </TouchableWithoutFeedback>
      ) : (
        scroll
      )}
    </KeyboardAvoidingView>
  );
}
