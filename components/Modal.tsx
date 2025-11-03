import { ModalProps } from "@/type";
import React, { useEffect, useRef } from "react";
import {
  Modal as RNModal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  View,
} from "react-native";



export default function Modal({
  open,
  onClose,
  dismissible = true,
  children,
  backdropClassName = "bg-black/50",
  contentClassName = "bg-white rounded-2xl p-5 w-11/12 ",
  testID,
}: ModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [open]);

  return (
    <RNModal
      transparent
      animationType="fade"
      visible={open}
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <Animated.View className="flex-1 items-center justify-center" style={{ opacity }}>
        <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
          <View className={["absolute inset-0", backdropClassName].join(" ")} />
        </TouchableWithoutFeedback>

        <Animated.View style={{ transform: [{ scale }] }}>
          <View className={contentClassName}>
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
